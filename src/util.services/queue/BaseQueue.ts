import { Browser, HTTPResponse, Page } from 'puppeteer1';
import { ProxyAuth, ProxyType } from '../../types/proxyAuth';
import { ErrorLog, isErrorFrequent } from '../queue/isErrorFrequent';
import { QueueStats, QueueTask, TaskTypes } from '../../types/QueueTask';
import { LoggerService } from '../../util/logger';
import { mainBrowser } from '../../util/browser/browsers';
import { closePage } from '../../util/browser/closePage';
import {
  CrawlerRequest,
  QueryRequest,
  ScanRequest,
} from '../../types/query-request';
import { prefixLink } from '../../util/matching/compare_helper';
import { avgNoPagesPerSession, getPage } from '../../util/browser/getPage';
import { checkForBlockingSignals } from './checkForBlockingSignals';
import { ErrorType, errorTypeCount, errorLog } from './ErrorTypes';
import {
  ACCESS_DENIED_FREQUENCE,
  DEFAULT_PAGE_TIMEOUT,
  EAN_PAGE_TIMEOUT,
  MAX_CRITICAL_ERRORS,
  MAX_RETRIES,
  MAX_RETRIES_NOT_FOUND,
  STANDARD_FREQUENCE,
  refererList,
} from '../../constants';
import { yieldBrowserVersion } from '../../util/browser/yieldBrowserVersion';
import { Versions } from '../../util/versionProvider';
import { sample, shuffle } from 'underscore';
import { Infos } from '../../types/Infos';
import { isDomainAllowed } from '../../util/isDomainAllowed';
import { createHash } from '../../util/hash';
import crypto from 'crypto';
import EventEmitter from 'events';
import { globalEventEmitter } from '../../util/events';
import { ICategory } from '../../util/crawl/getCategories';
import { Shop, WaitUntil } from '../../types/shop';
import {
  notifyProxyChange,
  registerRequest,
  requestCompleted,
  terminationPrevConnections,
} from '../../util/proxyFunctions';
import { isValidURL } from '../../util/isURLvalid';
type Task = (page: Page, request: any) => Promise<any>;

const usePremiumProxyTasks: TaskTypes[] = [
  'CRAWL_SHOP',
  'CRAWL_EAN',
  'DEALS_ON_EBY',
  'DEALS_ON_AZN',
  'DAILY_SALES',
  'CRAWL_EBY_LISTINGS',
  'CRAWL_AZN_LISTINGS',
  'SCAN_SHOP',
  'MATCH_PRODUCTS',
];

const shuffleTasks: TaskTypes[] = [
  'CRAWL_EAN',
  'LOOKUP_INFO',
  'DEALS_ON_EBY',
  'DEALS_ON_AZN',
  'CRAWL_EBY_LISTINGS',
  'CRAWL_AZN_LISTINGS',
  'QUERY_EANS_EBY',
  'LOOKUP_CATEGORY',
];

const multipleQueues: TaskTypes[] = [
  'DAILY_SALES',
  'LOOKUP_INFO',
  'WHOLESALE_SEARCH',
];

const resourceTypesPerTask: {
  [taskType in TaskTypes]: 'crawl' | 'product';
} = {
  DEALS_ON_EBY: 'product',
  DEALS_ON_AZN: 'product',
  DAILY_SALES: 'product',
  CRAWL_SHOP: 'crawl',
  WHOLESALE_SEARCH: 'crawl',
  WHOLESALE_EBY_SEARCH: 'crawl',
  SCAN_SHOP: 'crawl',
  MATCH_PRODUCTS: 'crawl',
  CRAWL_AZN_LISTINGS: 'product',
  CRAWL_EBY_LISTINGS: 'product',
  CRAWL_EAN: 'product',
  LOOKUP_INFO: 'crawl',
  QUERY_EANS_EBY: 'crawl',
  LOOKUP_CATEGORY: 'crawl',
};

const neverUsePremiumProxyDomains = ['amazon.de', 'ebay.de'];

const eligableForPremium = (link: string, taskType: TaskTypes) => {
  const url = new URL(link);
  return (
    usePremiumProxyTasks.includes(taskType) &&
    !neverUsePremiumProxyDomains.some((domain) => url.hostname.includes(domain))
  );
};

const getHost = (link: string) => {
  const url = new URL(link);
  return url.hostname;
};

export type WrapperFunctionResponse =
  | {
      status:
        | 'page-completed'
        | 'error-handled'
        | 'error-handled-domain-not-allowed'
        | 'error-handled-timeout-exceded'
        | 'limit-reached'
        | 'not-found';
      retries: number;
      proxyType: ProxyType;
      details: string;
    }
  | undefined;

export abstract class BaseQueue<
  T extends CrawlerRequest | QueryRequest | ScanRequest,
> {
  private queue: Array<{
    task: Task;
    request: T;
  }> = [];
  private running: number = 0;
  private concurrency: number;
  private browser: Browser | null = null;
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private pause: boolean = false;
  private requestCountPerHost: {
    [key: string]: number;
  } = {};
  public queueId: string;
  public taskFinished: boolean = false;
  /*
  if the timeouts need to be applied later
  */
  private errorLog: ErrorLog = errorLog;
  private criticalErrorCount: number = 0;
  private eventEmitter: EventEmitter = globalEventEmitter;
  public total = 0;
  public actualProductLimit = 0;
  private totalReached = false;
  public queueStats: QueueStats;
  private logged = false;
  private versionChooser: Generator<string, void, unknown> =
    yieldBrowserVersion();

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.queueId = crypto.randomUUID();
    this.queueTask = {
      ...task,
    };
    this.queueStats = {
      visitedPages: [],
      proxyTypes: {
        de: 0,
        mix: 0,
      },
      estimatedProducts: task.productLimit,
      statusHeuristic: {
        'error-handled': 0,
        'not-found': 0,
        'page-completed': 0,
        'limit-reached': 0,
        total: 0,
      },
      retriesHeuristic: {
        '0': 0,
        '1-9': 0,
        '10-49': 0,
        '50-99': 0,
        '100-499': 0,
        '500+': 0,
      },
      resetedSession: 0,
      errorTypeCount,
      browserStarts: 0,
    };
    this.actualProductLimit = task.actualProductLimit;
    this.concurrency = concurrency;
    this.proxyAuth = proxyAuth;
  }
  /* LOGGING */
  async log(msg: string | { [key: string]: any }) {
    let message: any = {
      shopDomain: this.queueTask.shopDomain,
      taskid: this.queueTask.id ?? '',
      type: this.queueTask.type,
    };
    if (typeof msg === 'string') {
      message['msg'] = msg;
    } else {
      message = { ...message, ...msg };
    }
    LoggerService.getSingleton().logger.info(message);
  }
  async logError(msg: string | { [key: string]: any }) {
    let message: any = {
      shopDomain: this.queueTask.shopDomain,
      taskid: this.queueTask.id ?? '',
      type: this.queueTask.type,
    };
    if (typeof msg === 'string') {
      message['msg'] = msg;
    } else {
      message = { ...message, ...msg };
    }
    LoggerService.getSingleton().errorLogger.error(message);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  async connect(): Promise<void> {
    const currentVersion = this.versionChooser.next().value as Versions;
    this.queueStats.browserStarts += 1;
    try {
      this.browser = await mainBrowser(this.proxyAuth, currentVersion);
    } catch (error) {
      this.logError(`Browser crashed big time  ${error}`);
      await this.repair(`Browser crashed big time  ${error}`);
    }
  }
  async disconnect(taskFinished = false): Promise<void> {
    this.taskFinished = taskFinished;
    try {
      if (this.browser?.connected && !taskFinished) {
        const pages = await this.browser.pages(); // Get all open pages
        // Iterate through each page and close it
        for (let page of pages) {
          await closePage(page);
        }
      }
    } catch (error) {
      this.logError({ msg: 'Could not close all pages', taskFinished });
    }

    try {
      await this.browser?.close();
    } catch (error) {
      this.logError({ msg: 'Could not close browser', taskFinished });
    }
  }
  linkExists(newLink: string) {
    return this.uniqueLinks.some((link) => link === newLink);
  }
  connected() {
    return this.browser?.connected;
  }
  async browserHealth() {
    const pages = await this.browser?.pages().catch((e) => {});
    let urls: string[] = [];
    let numberOfPages = 0;
    if (pages) {
      urls = pages.map((page: any) => {
        try {
          const url = page.url();
          return url;
        } catch (error) {
          return 'failed';
        }
      });
      numberOfPages = urls.filter((url) => url !== 'failed').length;
    }
    return {
      urls,
      connected: this.connected(),
      numberOfPages,
    };
  }
  async repair(reason?: string): Promise<void> {
    if (this.repairing) {
      await new Promise<void>((resolve) =>
        this.waitingForRepairResolvers.push(resolve),
      );
      return;
    }
    this.repairing = true;
    await this.disconnect();
    try {
      await this.connect();
      this.running = 0;
      this.repairing = false;
      this.waitingForRepairResolvers.forEach((resolve) => resolve());
      this.waitingForRepairResolvers = [];
    } catch (error) {
      this.logError({ msg: 'Cannot restart browser', reason });
    }
  }

  async syncRunningAndOpenPages() {
    try {
      const pages = await this.browser?.pages();
      if (pages) {
        const filteredPages = pages.filter(
          (page) => page.url() !== 'chrome://new-tab-page/',
        );
        this.running = filteredPages.length;
      }
    } catch (error) {
      this.logError({ msg: 'Cannot sync running and open pages' });
    }
  }

  initRequestCountPerHost(link: string) {
    const host = getHost(link);
    if (this.requestCountPerHost[host] === undefined) {
      this.requestCountPerHost[host] = 0;
    }
  }

  incrementRequestCount(link: string) {
    const host = getHost(link);
    if (this.requestCountPerHost[host] !== undefined) {
      this.requestCountPerHost[host] += 1;
    } else {
      this.requestCountPerHost[host] = 0;
    }
    return this.requestCountPerHost[host];
  }

  /*
  If a request is rate limited, we need to jump to the next user agent
  
  */

  jumpToNextUserAgent(link: string) {
    const host = getHost(link);
    const currRequestCount = this.requestCountPerHost[host];
    if (currRequestCount !== undefined) {
      const remainder = currRequestCount % avgNoPagesPerSession;
      if (remainder !== 0) {
        const necessaryRequests = avgNoPagesPerSession - remainder;
        this.requestCountPerHost[host] += necessaryRequests;
      } else {
        this.requestCountPerHost[host] += avgNoPagesPerSession;
      }
    } else {
      this.requestCountPerHost[host] = avgNoPagesPerSession;
    }
    return this.requestCountPerHost[host];
  }

  /*  QUEUE RELATED FUNCTIONS  */
  async clearQueue(event: string, infos: Infos) {
    await this.disconnect(true);
    this.queue = [];
    this.browser = null;
    this.running = 0;
    this.waitingForRepairResolvers = [];
    this.repairing = false;
    const {
      errorTypeCount,
      browserStarts,
      resetedSession,
      estimatedProducts,
      retriesHeuristic,
      statusHeuristic,
    } = this.queueStats;
    if (!this.logged) {
      this.logged = true;
      this.log({
        errorTypes: errorTypeCount,
        browserStarts,
        infos: {
          ...infos,
          estimatedProducts,
        },
        resetedSession,
        statusHeuristic,
        retriesHeuristic,
        event,
      });
    }
    this.errorLog = errorLog;
    this.criticalErrorCount = 0;
    return this.queueTask;
  }
  resumeQueue() {
    this.pause = false;
    this.running = 0;
    for (let index = 0; index <= this.concurrency; index++) {
      setTimeout(() => this.next(), index * 1000);
    }
  }
  pauseQueue(reason: 'error' | 'rate-limit' | 'blocked') {
    if (this.pause) return;
    this.pause = true;
    this.repair(reason).then(() => {
      setTimeout(() => {
        this.resumeQueue();
      }, 5000);
    });

    // reset error count, so browser is not restarted again
    this.criticalErrorCount = 0;

    //Reset errors
    Object.keys(this.errorLog).forEach((errorType) => {
      this.errorLog[errorType].count = 0;
      this.errorLog[errorType].lastOccurred = null;
    });
  }
  public idle() {
    return this.taskFinished;
  }
  public workload() {
    return this.queue.length;
  }

  public addTasksToQueue(tasks: { task: Task; request: T }[]) {
    this.queue.push(...tasks);
    this.next();
  }
  public pullTasksFromQueue() {
    if (this.queue.length < 4) return null;

    if (this.queue.length % 2) {
      //odd
      const start = Math.floor(this.queue.length / 2 + 1);
      return this.queue.splice(start);
    } else {
      //even
      const start = this.queue.length / 2;
      return this.queue.splice(start);
    }
  }

  private resetCookies = async (page: Page) => {
    this.queueStats.resetedSession += 1;
    // Clear cookies
    const cookies = await page.cookies().catch((e) => {
      console.error('Failed to get cookies:', e?.message);
    });
    if (cookies)
      await page.deleteCookie(...cookies).catch((e) => {
        console.error('Failed to delete cookies:', e?.message);
      });

    // Clear localStorage and sessionStorage
    await page
      .evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      })
      .catch((e) => {
        console.error('Failed to clear storage:', e?.message);
      });
  };

  private visitPage = async (
    page: Page,
    pageInfo: ICategory,
    waitUntil: WaitUntil,
    requestId: string,
    allowedHosts: string[] = [],
    proxyType: ProxyType,
  ) => {
    const originalGoto = page.goto;
    page.goto = async function (url, options) {
      if (proxyType !== 'mix') {
        await notifyProxyChange(
          proxyType,
          pageInfo.link,
          requestId,
          Date.now(),
          allowedHosts,
        );
      } else {
        await registerRequest(url, requestId, allowedHosts, Date.now());
      }
      return originalGoto.apply(this, [url, options]);
    };

    return page.goto(pageInfo.link, {
      waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
      timeout:
        this.queueTask.type === 'CRAWL_EAN'
          ? EAN_PAGE_TIMEOUT
          : DEFAULT_PAGE_TIMEOUT,
    });
  };

  private async refreshPage(page: Page): Promise<HTTPResponse | null> {
    return page.reload();
  }

  private terminateAndSetProxy = async ({
    errorType,
    link,
    request,
    shop,
    eligableForPremiumProxy,
    throwErr,
  }: {
    errorType: string;
    eligableForPremiumProxy: boolean;
    request: any;
    link: string;
    shop: Shop;
    throwErr: boolean;
  }) => {
    const { allowedHosts, proxyType } = shop;
    const { requestId } = request;
    await terminationPrevConnections(requestId, link, allowedHosts, proxyType);
    if (eligableForPremiumProxy) {
      request.prevProxyType = proxyType;
      request.proxyType = 'de';
    }
    if (throwErr) {
      throw new Error(errorType);
    }
  };

  async wrapperFunction(
    task: Task,
    request: T,
  ): Promise<WrapperFunctionResponse> {
    if (this.taskFinished) return;
    let { type } = this.queueTask;
    const {
      retries,
      proxyType,
      prevProxyType,
      pageInfo,
      shop,
      requestId,
      retriesOnFail,
    } = request;
    const { link } = pageInfo;

    const isLinkValidUrl = isValidURL(link);

    if(!isLinkValidUrl) {
      return {
        details: `⛔ Id: ${requestId} - Invalid URL - ${link}`,
        status: 'error-handled',
        retries,
        proxyType,
      };
    }


    this.initRequestCountPerHost(link);
    const {
      waitUntil,
      resourceTypes,
      allowedHosts,
      exceptions,
      rules,
      mimic,
      leaveDomainAsIs,
      d: domain,
    } = shop;

    const hash = 's_hash' in request ? request.s_hash : createHash(link);

    if (retriesOnFail && retries >= retriesOnFail) {
      if ('onNotFound' in request && request?.onNotFound) {
        await request.onNotFound('exceedsLimit');
      }
      return {
        details: `⛔ Id: ${requestId} - Retries exceeded - ${domain} - Hash: ${hash}`,
        status: 'limit-reached',
        retries,
        proxyType: proxyType,
      };
    }

    if (retries > MAX_RETRIES) {
      if ('onNotFound' in request && request?.onNotFound) {
        await request.onNotFound('exceedsLimit');
      }
      this.queueStats.retriesHeuristic['500+'] += 1;
      return {
        details: `⛔ Id: ${requestId} - Retries exceeded - ${domain} - Hash: ${hash}`,
        status: 'error-handled',
        retries,
        proxyType,
      };
    }

    pageInfo.link = prefixLink(link, domain, leaveDomainAsIs);

    const eligableForPremiumProxy = eligableForPremium(link, type);

    this.queueStats.statusHeuristic['total'] += 1;
    let page: Page | undefined = undefined;

    try {
      if (eligableForPremiumProxy && prevProxyType && retries > 0) {
        await terminationPrevConnections(
          requestId,
          link,
          allowedHosts,
          prevProxyType,
        );
      }

      let disAllowedResourceTypes = resourceTypes?.crawl;
      if (
        resourceTypes &&
        resourceTypes[resourceTypesPerTask[type]] !== undefined
      ) {
        disAllowedResourceTypes =
          resourceTypes[resourceTypesPerTask[type]] || [];
      }
      const pageAndPrint = await getPage({
        browser: this.browser!,
        host: getHost(link),
        shop,
        requestCount: this.requestCountPerHost[getHost(link)] || 0,
        disAllowedResourceTypes,
        exceptions,
        rules,
        proxyType,
      });
      page = pageAndPrint.page;

      process.env.DEBUG === 'true' &&
        console.log(
          getHost(link),
          'requestCount: ',
          this.requestCountPerHost[getHost(link)] || 0,
          'print: ',
          pageAndPrint.fingerprint,
        );

      if (
        retries === 0 &&
        type !== 'LOOKUP_INFO' &&
        type !== 'WHOLESALE_SEARCH'
      ) {
        const referer = sample(refererList) ?? refererList[0];
        await page.setExtraHTTPHeaders({
          referer,
        });
      }
      const response = await this.visitPage(
        page,
        pageInfo,
        waitUntil,
        requestId,
        allowedHosts || [],
        proxyType,
      );

      if (response) {
        const status = response.status();
        const handleError = async (
          status: number,
          requestId: string,
          page: any,
          retries: number,
          proxyType: string | undefined,
          request: any,
          statistics: any,
        ) => {
          if (status === 404) {
            const errorType = ErrorType.NotFound;
            this.queueStats.errorTypeCount[errorType] += 1;
            if (retries <= MAX_RETRIES_NOT_FOUND) {
              await this.terminateAndSetProxy({
                errorType,
                request,
                shop,
                link,
                eligableForPremiumProxy,
                throwErr: true,
              });
            } else {
              if ('onNotFound' in request && request?.onNotFound) {
                await request.onNotFound('notFound');
              }
              return {
                details: `❓ Id: ${requestId} - ${type} - ${domain} - Hash: ${hash}`,
                status: 'not-found',
                retries,
                proxyType,
              };
            }
          }

          if (status === 429) {
            await this.terminateAndSetProxy({
              errorType: ErrorType.RateLimit,
              request,
              shop,
              link,
              eligableForPremiumProxy,
              throwErr: true,
            });
          }

          if (status === 403 || status >= 500) {
            const newResponse = await this.refreshPage(page).catch((e) => {
              console.log('retry', e);
            });
            const newStatus = newResponse?.status();
            if (newStatus !== 200) {
              await this.terminateAndSetProxy({
                errorType:
                  status === 403
                    ? ErrorType.AccessDenied
                    : ErrorType.ServerError,
                eligableForPremiumProxy,
                request,
                shop,
                link,
                throwErr: true,
              });
            }
          }
        };

        if (!this.taskFinished) {
          await handleError(
            status,
            requestId,
            page,
            retries,
            proxyType,
            request,
            this.queueStats,
          );
        }
      }

      const blocked = await checkForBlockingSignals(
        page,
        false,
        mimic,
        link,
        this.queueTask,
      );

      if (blocked) {
        await this.terminateAndSetProxy({
          errorType: ErrorType.AccessDenied,
          request,
          shop,
          link,
          eligableForPremiumProxy,
          throwErr: true,
        });
      }

      const message = await task(page, request);
      if (
        type === 'CRAWL_SHOP' &&
        !this.queueStats.visitedPages.includes(pageInfo.link)
      ) {
        this.queueStats.visitedPages.push(pageInfo.link);
      }
      await requestCompleted(requestId);
      this.incrementRequestCount(link);
      const details = `🆗 Id: ${requestId}${message && typeof message === 'string' ? ` - ${message} - ` : ` - ${type} - `}${'targetShop' in request ? request.targetShop?.name : domain} - Hash: ${hash}`;
      return {
        details,
        status: 'page-completed',
        retries,
        proxyType,
      };
    } catch (error) {
      const errorType = this.parseError(error);

      process.env.DEBUG === 'true' &&
        console.log('WrapperFunction:Error:', error);
      if (this.taskFinished) return;

      if (!this.repairing) {
        if (error instanceof Error) {
          if (
            errorType === ErrorType.RateLimit ||
            errorType === ErrorType.AccessDenied ||
            errorType === ErrorType.ServerError ||
            errorType === ErrorType.NotFound
          ) {
            if (this.criticalErrorCount > MAX_CRITICAL_ERRORS) {
              this.jumpToNextUserAgent(link);
              this.pauseQueue('error');
            } else {
              this.queueStats.errorTypeCount[errorType] += 1;
              if (
                isErrorFrequent(
                  errorType,
                  ACCESS_DENIED_FREQUENCE,
                  this.errorLog,
                )
              ) {
                this.criticalErrorCount += 1;
                this.jumpToNextUserAgent(link);
                page && (await this.resetCookies(page));
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }
          }
          if (errorType === ErrorType.ProtocolError) {
            this.queueStats.errorTypeCount[errorType] += 1;
            this.pauseQueue('error');
          }
          if (isErrorFrequent(errorType, STANDARD_FREQUENCE, this.errorLog)) {
            if (errorType === ErrorType.RateLimit) {
              await this.terminateAndSetProxy({
                errorType,
                eligableForPremiumProxy,
                request,
                shop,
                link,
                throwErr: false,
              });
              this.jumpToNextUserAgent(link);
              page && (await this.resetCookies(page));

              if (type === 'CRAWL_SHOP') {
                this.pauseQueue('error');
              }
            } else if (errorType === ErrorType.ERR_TUNNEL_CONNECTION_FAILED) {
              terminationPrevConnections(
                requestId,
                link,
                allowedHosts,
                proxyType,
              );
            } else if (
              errorType !== ErrorType.EanOnEbyNotFound &&
              errorType !== ErrorType.AznNotFound &&
              errorType !== ErrorType.AznProductInfoEmpty &&
              errorType !== ErrorType.AznUnexpectedError
            ) {
              this.pauseQueue('error');
            }
          } else {
            this.errorLog[errorType].count += 1;
            this.errorLog[errorType].lastOccurred = Date.now();
          }
        } else {
          const errorType = ErrorType.UnknowError;
          this.pauseQueue('error');
          this.errorLog[errorType].count += 1;
          this.errorLog[errorType].lastOccurred = Date.now();
          this.queueStats.errorTypeCount[errorType] += 1;
        }
      }

      const details = `⛔ Id: ${requestId} - ${type} - ${error} - ${domain} - Hash: ${hash}`;

      if (isDomainAllowed(pageInfo.link)) {
        if (error instanceof Error) {
          if (errorType === ErrorType.Timeout) {
            if (retries < (retriesOnFail || MAX_RETRIES)) {
              await this.terminateAndSetProxy({
                errorType,
                request,
                shop,
                link,
                throwErr: false,
                eligableForPremiumProxy,
              });
              this.pushTask(task, { ...request, retries: retries + 1 });
            } else {
              if ('onNotFound' in request && request?.onNotFound) {
                request.onNotFound('timeout');
              }
              return {
                details,
                status: 'error-handled-timeout-exceded',
                retries,
                proxyType,
              };
            }
          } else {
            this.pushTask(task, { ...request, retries: retries + 1 });
          }
        } else {
          this.pushTask(task, { ...request, retries: retries + 1 });
        }
      } else {
        if ('onNotFound' in request && request?.onNotFound) {
          await request.onNotFound('domainNotAllowed');
        }
        return {
          details,
          status: 'error-handled-domain-not-allowed',
          retries,
          proxyType,
        };
      }

      return {
        details,
        status: 'error-handled',
        retries,
        proxyType,
      };
    } finally {
      if (page) await closePage(page);
    }
  }
  private parseError(error: Error | unknown) {
    const isError = error instanceof Error;
    switch (true) {
      case isError && error.message === ErrorType.AznProductInfoEmpty:
        return ErrorType.AznProductInfoEmpty;
      case isError && error.message === ErrorType.AznUnexpectedError:
        return ErrorType.AznUnexpectedError;
      case isError && error.message === ErrorType.AznTimeout:
        return ErrorType.AznTimeout;
      case isError && error.message === ErrorType.AznNotFound:
        return ErrorType.AznNotFound;
      case isError && error.message === ErrorType.EanOnEbyNotFound:
        return ErrorType.EanOnEbyNotFound;
      case isError && error.message === ErrorType.RateLimit:
        return ErrorType.RateLimit;
      case isError && error.message === ErrorType.AccessDenied:
        return ErrorType.AccessDenied;
      case isError && error.message === ErrorType.ServerError:
        return ErrorType.ServerError;
      case isError && error.message === ErrorType.NotFound:
        return ErrorType.NotFound;
      case `${error}`.includes('TimeoutError'):
        return ErrorType.Timeout;
      case `${error}`.includes('Protocol error') ||
        `${error}`.includes('ProtocolError'):
        return ErrorType.ProtocolError;
      case `${error}`.includes('Navigating frame was detached'):
        return ErrorType.NavigatingFrameDetached;
      case `${error}`.includes('net::ERR_HTTP2_PROTOCOL_ERROR'):
        return ErrorType.RateLimit;
      case `${error}`.includes('net::ERR_TUNNEL_CONNECTION_FAILED'):
        return ErrorType.ERR_TUNNEL_CONNECTION_FAILED;
      case `${error}`.includes('net::ERR_TIMED_OUT'):
        return ErrorType.ERR_TIMED_OUT;
      case `${error}`.includes('net::ERR_EMPTY_RESPONSE'):
        return ErrorType.ERR_EMPTY_RESPONSE;
      case `${error}`.includes('net::ERR_CONNECTION_CLOSED'):
        return ErrorType.ERR_CONNECTION_CLOSED;
      default:
        return ErrorType.UnknowError;
    }
  }

  pushTask(task: Task, request: T) {
    this.queue.push({ task, request });
    this.next();
  }

  next(): void {
    if (
      multipleQueues.includes(this.queueTask.type) &&
      this.queue.length === 0
    ) {
      this.eventEmitter.emit(`${this.queueId}-finished`, {
        queueId: this.queueId,
      });
    } else {
      if (!this.totalReached && this.total === this.actualProductLimit) {
        this.totalReached = true;
        this.eventEmitter.emit(`${this.queueId}-finished`, {
          queueId: this.queueId,
        });
      }
    }
    if (
      this.pause ||
      this.taskFinished ||
      this.repairing ||
      this.running >= this.concurrency ||
      this.queue.length === 0
    ) {
      return;
    }
    this.running++;

    console.log('Running: ', this.running, 'Queue:', this.queue.length);

    if (shuffleTasks.includes(this.queueTask.type)) {
      this.queue = shuffle(this.queue);
    }
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      this.wrapperFunction(nextRequest.task, nextRequest.request).then(
        async (result: WrapperFunctionResponse) => {
          this.running--;
          await this.syncRunningAndOpenPages();
          this.next();
          if (result) {
            const { retries, status, proxyType } = result;
            switch (true) {
              case status === 'not-found':
                this.queueStats.statusHeuristic['not-found'] += 1;
                break;
              case status === 'error-handled':
                this.queueStats.proxyTypes[proxyType] += 1;
                this.queueStats.statusHeuristic['error-handled'] += 1;
                break;
              case status === 'page-completed':
                this.queueStats.proxyTypes[proxyType] += 1;
                this.queueStats.statusHeuristic['page-completed'] += 1;
                break;
              case status === 'limit-reached':
                this.queueStats.statusHeuristic['limit-reached'] += 1;
                break;
            }
            switch (true) {
              case retries === 0:
                this.queueStats.retriesHeuristic['0'] += 1;
                break;
              case retries >= 0 && retries < 10:
                this.queueStats.retriesHeuristic['1-9'] += 1;
                break;
              case retries >= 10 && retries < 50:
                this.queueStats.retriesHeuristic['10-49'] += 1;
                break;
              case retries >= 50 && retries < 100:
                this.queueStats.retriesHeuristic['50-99'] += 1;
                break;
              case retries >= 100 && retries < 500:
                this.queueStats.retriesHeuristic['100-499'] += 1;
                break;
            }
          }
          console.log(
            ` Details: ${result?.details}, Status: ${result?.status}, Retries: ${result?.retries} ProxyType: ${result?.proxyType}`,
          );
        },
      );
    }
  }
}
