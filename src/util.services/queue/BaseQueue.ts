import { HTTPResponse, Page } from 'puppeteer1';
import { ProxyAuth, ProxyType, standardTimeZones } from '../../types/proxyAuth';
import { ErrorLog, isErrorFrequent } from '../queue/isErrorFrequent';
import { QueueTask, TaskTypes } from '../../types/QueueTask';
import { LoggerService } from '../../util/logger';
import { mainBrowser } from '../../util/browser/browsers';
import { closePage } from '../../util/browser/closePage';
import {
  CrawlerRequest,
  QueryRequest,
  ScanRequest,
} from '../../types/query-request';
import { prefixLink } from '../../util/matching/compare_helper';
import { getPage } from '../../util/browser/getPage';
import { checkForBlockingSignals } from './checkForBlockingSignals';
import { ErrorType, errorTypeCount, errorTypes } from './ErrorTypes';
import { createLabeledTimeout } from './createLabeledTimeout';
import {
  ACCESS_DENIED_FREQUENCE,
  DEFAULT_PAGE_TIMEOUT,
  EAN_PAGE_TIMEOUT,
  MAX_CRITICAL_ERRORS,
  MAX_RETRIES,
  MAX_RETRIES_NOT_FOUND,
  RANDOM_TIMEOUT_MAX,
  RANDOM_TIMEOUT_MIN,
  STANDARD_FREQUENCE,
  refererList,
} from '../../constants';
import { yieldBrowserVersion } from '../../util/browser/yieldBrowserVersion';
import { Versions } from '../../util/versionProvider';
import { has, sample, shuffle } from 'underscore';
import { Infos } from '../../types/Infos';
import { isDomainAllowed } from '../../util/isDomainAllowed';
import { createHash } from '../../util/hash';
import crypto from 'crypto';
import EventEmitter from 'events';
import { globalEventEmitter } from '../../util/events';
import { ICategory } from '../../util/crawl/getCategories';
import { WaitUntil } from '../../types/shop';
import {
  connectionHealth,
  notifyProxyChange,
  registerRequest,
  requestCompleted,
  terminationPrevConnections,
} from '../../util/proxyFunctions';
import { sleep } from '../../util/extract';
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
const neverUsePremiumProxyDomains = ['amazon.de', 'ebay.de'];

const eligableForPremium = (link: string, taskType: TaskTypes) => {
  const url = new URL(link);
  return (
    usePremiumProxyTasks.includes(taskType) &&
    !neverUsePremiumProxyDomains.some((domain) => url.hostname.includes(domain))
  );
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
  private browser: any | null = null;
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private pause: boolean = false;
  public queueId: string;
  public taskFinished: boolean = false;
  /*
  if the timeouts need to be applied later
  */
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];
  private errorLog: ErrorLog = errorTypes;
  private requestCount: number = 0;
  private criticalErrorCount: number = 0;
  private eventEmitter: EventEmitter = globalEventEmitter;
  public total = 0;
  public actualProductLimit = 0;
  private totalReached = false;
  private versionChooser: Generator<string, void, unknown> =
    yieldBrowserVersion();

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.queueId = crypto.randomUUID();
    this.queueTask = {
      ...task,
      statistics: {
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
      },
    };
    this.actualProductLimit = task.actualProductLimit;
    this.concurrency = concurrency; //new page
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
    const listeners = this.eventEmitter.listeners(`${this.queueId}-finished`);
    this.queueTask.statistics.browserStarts += 1;
    try {
      this.browser = await mainBrowser(
        this.queueTask,
        this.proxyAuth,
        currentVersion,
      );
    } catch (error) {
      this.logError(`Browser crashed big time  ${error}`);
      await this.repair(`Browser crashed big time  ${error}`);
    }
  }
  async disconnect(taskFinished = false): Promise<void> {
    this.taskFinished = taskFinished;
    if (taskFinished) {
      this.timeouts.forEach((timeout) => clearTimeout(timeout.timeout));
      this.timeouts = [];
    }
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
      this.logError({ msg: 'Could not restart browser', taskFinished });
    }
  }
  linkExists(newLink: string) {
    return this.uniqueLinks.some((link) => link === newLink);
  }
  connected() {
    return this.browser?.connected;
  }
  async browserHealth() {
    const pages = await this.browser?.pages().catch((e: any) => {});
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
  /*  QUEUE RELATED FUNCTIONS  */
  async clearQueue(event: string, infos: Infos) {
    await this.disconnect(true);
    this.queue = [];
    this.timeouts = [];
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
    } = this.queueTask.statistics;
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
    this.errorLog = errorTypes;
    this.requestCount = 0;
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
    // next user agent;
    this.requestCount += 1;

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
  private clearTimeout = (id: string) => {
    const timeout = this.timeouts.find((timeout) => timeout.id === id);
    if (timeout) {
      clearTimeout(timeout.timeout);
      this.timeouts = this.timeouts.filter((timeout) => timeout.id !== id);
    }
  };
  private resetCookies = async (page: Page) => {
    this.queueTask.statistics.resetedSession += 1;
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
    proxyType?: ProxyType,
  ) => {
    const originalGoto = page.goto;
    page.goto = async function (url, options) {
      if (proxyType) {
        const notifyResponse = await notifyProxyChange(
          proxyType,
          pageInfo.link,
          requestId,
          Date.now(),
          allowedHosts,
        );
        // console.log(notifyResponse);
      } else {
        const registerResponse = await registerRequest(
          url,
          requestId,
          allowedHosts,
          Date.now(),
        );
        // console.log(registerResponse);

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

  async wrapperFunction(
    task: Task,
    request: T,
    id: string,
  ): Promise<WrapperFunctionResponse> {
    if (this.taskFinished) return;

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
    let { type, statistics, timezones } = this.queueTask;
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
        await request.onNotFound('timeout');
      }
      return {
        details: `⛔ Id: ${requestId} - Retries exceeded - ${domain} - Hash: ${hash}`,
        status: 'limit-reached',
        retries,
        proxyType: proxyType || 'mix',
      };
    }

    if (retries > MAX_RETRIES) {
      if ('onNotFound' in request && request?.onNotFound) {
        await request.onNotFound('timeout');
      }
      statistics.retriesHeuristic['500+'] += 1;
      return {
        details: `⛔ Id: ${requestId} - Retries exceeded - ${domain} - Hash: ${hash}`,
        status: 'error-handled',
        retries,
        proxyType: proxyType || 'mix',
      };
    }

    pageInfo.link = prefixLink(link, domain, leaveDomainAsIs);

    const eligableForPremiumProxy = eligableForPremium(link, type);

    statistics.statusHeuristic['total'] += 1;
    let page: Page | undefined = undefined;

    try {
      if (proxyType) {
        timezones = [standardTimeZones[proxyType]];
      }
      if (eligableForPremiumProxy && prevProxyType && retries > 0) {
        await terminationPrevConnections(
          requestId,
          link,
          allowedHosts,
          prevProxyType,
        );
      }
      page = await getPage({
        browser: this.browser!,
        shop,
        requestCount: this.requestCount,
        disAllowedResourceTypes: resourceTypes?.query,
        exceptions,
        rules,
        timezones,
        requestId,
      });

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

      const terminateAndSetProxy = async (errorType: string) => {
        await terminationPrevConnections(
          requestId,
          link,
          allowedHosts,
          proxyType || 'mix',
        );
        if (eligableForPremiumProxy) {
          request.prevProxyType = proxyType || 'mix';
          request.proxyType = 'de';
        }
        throw new Error(errorType);
      };

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
            statistics.errorTypeCount[errorType] += 1;
            if (retries < MAX_RETRIES_NOT_FOUND) {
              throw new Error(ErrorType.NotFound);
            } else {
              if ('onNotFound' in request && request?.onNotFound) {
                await request.onNotFound('notFound');
              }
              return {
                details: `❓ Id: ${requestId} - ${type} - ${domain} - Hash: ${hash}`,
                status: 'not-found',
                retries,
                proxyType: proxyType || 'mix',
              };
            }
          }

          if (status === 429) {
            await terminateAndSetProxy(ErrorType.RateLimit);
          }

          if (status === 403 || status >= 500) {
            const newResponse = await this.refreshPage(page).catch((e) => {
              console.log('retry', e);
            });
            const newStatus = newResponse?.status();
            if (newStatus !== 200) {
              await terminateAndSetProxy(
                status === 403 ? ErrorType.AccessDenied : ErrorType.ServerError,
              );
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
            statistics,
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
        await terminateAndSetProxy(ErrorType.AccessDenied);
      }

      const message = await task(page, request);
      if (
        type === 'CRAWL_SHOP' &&
        !statistics.visitedPages.includes(pageInfo.link)
      ) {
        statistics.visitedPages.push(pageInfo.link);
      }
      await requestCompleted(requestId);
      const details = `🆗 Id: ${requestId}${message && typeof message === 'string' ? ` - ${message} - ` : ` - ${type} - `}${'targetShop' in request ? request.targetShop?.name : domain} - Hash: ${hash}`;
      return {
        details,
        status: 'page-completed',
        retries,
        proxyType: proxyType || 'mix',
      };
    } catch (error) {
      process.env.DEBUG === 'true' &&
        console.log('WrapperFunction:Error:', error);
      if (!this.taskFinished) {
        if (!this.repairing) {
          if (error instanceof Error) {
            if (
              error.message === ErrorType.RateLimit ||
              error.message === ErrorType.AccessDenied ||
              error.message === ErrorType.ServerError ||
              error.message === ErrorType.NotFound
            ) {
              if (this.criticalErrorCount > MAX_CRITICAL_ERRORS) {
                this.pauseQueue('error');
              } else {
                const errorType = error.message as ErrorType;
                statistics.errorTypeCount[errorType] += 1;
                if (
                  isErrorFrequent(
                    errorType,
                    ACCESS_DENIED_FREQUENCE,
                    this.errorLog,
                  )
                ) {
                  this.criticalErrorCount += 1;
                  this.requestCount += 1;
                  page && (await this.resetCookies(page));
                } else {
                  this.errorLog[errorType].count += 1;
                  this.errorLog[errorType].lastOccurred = Date.now();
                }
              }
            }
            if (
              `${error}`.includes('Protocol error') ||
              `${error}`.includes('ProtocolError')
            ) {
              console.log('Restart browser because of protocol error');
              const errorType = ErrorType.ProtocolError;
              statistics.errorTypeCount[errorType] += 1;
              this.pauseQueue('error');
            }
            const errorType = this.parseError(error);
            if (errorType) {
              statistics.errorTypeCount[errorType] += 1;
              if (
                isErrorFrequent(errorType, STANDARD_FREQUENCE, this.errorLog)
              ) {
                this.pauseQueue('error');
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }
          } else {
            let errorType = ErrorType.UnknowError;
            this.pauseQueue('error');
            this.errorLog[errorType].count += 1;
            this.errorLog[errorType].lastOccurred = Date.now();
            statistics.errorTypeCount[errorType] += 1;
          }
        }
        const details = `⛔ Id: ${requestId} - ${type} - ${error} - ${domain} - Hash: ${hash}`;
        if (isDomainAllowed(pageInfo.link)) {
          if (error instanceof Error) {
            if (`${error}`.includes('TimeoutError: Navigation timeout')) {
              if (retries < 1) {
                this.pushTask(task, { ...request, retries: retries + 1 });
              } else {
                if ('onNotFound' in request && request?.onNotFound) {
                  request.onNotFound('timeout');
                }
                return {
                  details,
                  status: 'error-handled-timeout-exceded',
                  retries,
                  proxyType: proxyType || 'mix',
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
            proxyType: proxyType || 'mix',
          };
        }

        return {
          details,
          status: 'error-handled',
          retries,
          proxyType: proxyType || 'mix',
        };
      }
    } finally {
      this.clearTimeout(id);
      if (page) await closePage(page);
    }
  }
  private parseError(error: Error) {
    switch (true) {
      case error.message.includes('Navigating frame was detached'):
        return ErrorType.NavigatingFrameDetached;
      case error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR'):
        return ErrorType.RateLimit;
      case error.message.includes('net::ERR_TUNNEL_CONNECTION_FAILED'):
        return ErrorType.ERR_TUNNEL_CONNECTION_FAILED;
      case error.message.includes('net::ERR_TIMED_OUT'):
        return ErrorType.ERR_TIMED_OUT;
      default:
        return false;
    }
  }
  private randomTimeout(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  pushTask(task: Task, request: T) {
    this.queue.push({ task, request });
    this.next();
  }

  next(): void {
    const tasks = ['DAILY_DEALS', 'LOOKUP_INFO', 'WHOLESALE_SEARCH'];

    if (tasks.includes(this.queueTask.type) && this.queue.length === 0) {
      console.log('Multiple queue completed:', this.queueId);
      this.eventEmitter.emit(`${this.queueId}-finished`, {
        queueId: this.queueId,
      });
    } else {
      if (!this.totalReached && this.total === this.actualProductLimit) {
        this.totalReached = true;
        console.log('Queue completed:', this.queueId);
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

    if (shuffleTasks.includes(this.queueTask.type)) {
      this.queue = shuffle(this.queue);
    }
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      const timeoutTime = this.randomTimeout(
        RANDOM_TIMEOUT_MIN,
        RANDOM_TIMEOUT_MAX,
      );
      const id = crypto.randomBytes(8).toString('hex');
      const timeout = createLabeledTimeout(
        () =>
          this.wrapperFunction(nextRequest.task, nextRequest.request, id).then(
            (result: WrapperFunctionResponse) => {
              this.running--;
              this.next();
              if (result) {
                const { retries, status, proxyType } = result;
                switch (true) {
                  case status === 'not-found':
                    this.queueTask.statistics.statusHeuristic['not-found'] += 1;
                    break;
                  case status === 'error-handled':
                    this.queueTask.statistics.statusHeuristic[
                      'error-handled'
                    ] += 1;
                    break;
                  case status === 'page-completed':
                    this.queueTask.statistics.proxyTypes[proxyType] += 1;
                    this.queueTask.statistics.statusHeuristic[
                      'page-completed'
                    ] += 1;
                    break;
                  case status === 'limit-reached':
                    this.queueTask.statistics.statusHeuristic[
                      'limit-reached'
                    ] += 1;
                    break;
                }
                switch (true) {
                  case retries === 0:
                    this.queueTask.statistics.retriesHeuristic['0'] += 1;
                    break;
                  case retries >= 0 && retries < 10:
                    this.queueTask.statistics.retriesHeuristic['1-9'] += 1;
                    break;
                  case retries >= 10 && retries < 50:
                    this.queueTask.statistics.retriesHeuristic['10-49'] += 1;
                    break;
                  case retries >= 50 && retries < 100:
                    this.queueTask.statistics.retriesHeuristic['50-99'] += 1;
                    break;
                  case retries >= 100 && retries < 500:
                    this.queueTask.statistics.retriesHeuristic['100-499'] += 1;
                    break;
                }
              }
              console.log(
                ` Details: ${result?.details}, Status: ${result?.status}, Retries: ${result?.retries} ProxyType: ${result?.proxyType}`,
              );
            },
          ),
        timeoutTime,
        id,
      );
      this.timeouts.push(timeout);
    }
  }
}
