import { Browser, Page } from 'puppeteer1';
import { ProxyAuth } from '../../types/proxyAuth';
import { ErrorLog, isErrorFrequent } from '../queue/isErrorFrequent';
import { QueueTask } from '../../types/QueueTask';
import { LoggerService } from '../../util/logger';
import { mainBrowser } from '../../util/browser/browsers';
import { closePage } from '../../util/browser/closePage';
import { CrawlerRequest, QueryRequest } from '../../types/query-request';
import { prefixLink } from '../../util/matching/compare_helper';
import { getPage } from '../../util/browser/getPage';
import { checkForBlockingSignals } from '../queue/checkPageHealth';
import { ErrorType, errorTypeCount, errorTypes } from './ErrorTypes';
import { createLabeledTimeout } from './createLabeledTimeout';
import crypto from 'crypto';
import {
  ACCESS_DENIED_FREQUENCE,
  MAX_CRITICAL_ERRORS,
  MAX_RETRIES,
  RANDOM_TIMEOUT_MAX,
  RANDOM_TIMEOUT_MIN,
  STANDARD_FREQUENCE,
  refererList,
} from '../../constants';
import { yieldBrowserVersion } from '../../util/browser/yieldBrowserVersion';
import { Versions } from '../../util/versionProvider';
import { sample } from 'underscore';

type Task = (page: Page, request: any) => Promise<void>;

export type WrapperFunctionResponse =
  | {
      status:
        | 'page-completed'
        | 'error-handled'
        | 'limit-reached'
        | 'not-found';
      retries: number;
    }
  | undefined;

export abstract class BaseQueue<T extends CrawlerRequest | QueryRequest> {
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
  public taskFinished: boolean = false;
  /*
  if the timeouts need to be applied later
  */
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];
  private errorLog: ErrorLog = errorTypes;
  private requestCount: number = 0;
  private criticalErrorCount: number = 0;
  private versionChooser: Generator<string, void, unknown> =
    yieldBrowserVersion();

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.queueTask = {
      ...task,
      statistics: {
        expectedProducts: task.productLimit,
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
    try {
      if (taskFinished) {
        this.timeouts.forEach((timeout) => clearTimeout(timeout.timeout));
        this.timeouts = [];
      }
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
  async clearQueue(event: string) {
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
      expectedProducts,
      retriesHeuristic,
      statusHeuristic,
    } = this.queueTask.statistics;
    this.log({
      errorTypes: errorTypeCount,
      browserStarts,
      expectedProducts,
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

  private clearTimeout = (id: string) => {
    const timeout = this.timeouts.find((timeout) => timeout.id === id);
    if (timeout) {
      clearTimeout(timeout.timeout);
      this.timeouts = this.timeouts.filter((timeout) => timeout.id !== id);
    }
  };

  private resetCookies = async (page: Page) => {
    console.log('reseting session');
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

  async wrapperFunction(
    task: Task,
    request: T,
    id: string,
  ): Promise<WrapperFunctionResponse> {
    let response = {
      status: 'page-completed',
      retries: 0,
    };
    const { retries } = request;
    if (retries > MAX_RETRIES) {
      this.queueTask.statistics.retriesHeuristic['500+'] += 1;
      return { status: 'error-handled', retries };
    }

    let { pageInfo, shop } = request;
    pageInfo.link = prefixLink(pageInfo.link, shop.d);

    const { waitUntil, resourceTypes } = shop;

    this.uniqueLinks.push(pageInfo.link);
    this.queueTask.statistics.statusHeuristic['total'] += 1;
    let page: Page | undefined = undefined;

    try {
      page = await getPage(
        this.browser!,
        this.requestCount,
        resourceTypes?.query,
        shop.exceptions,
        shop.rules,
      );

      if (retries === 0) {
        const referer = sample(refererList) ?? refererList[0];
        await page.setExtraHTTPHeaders({
          referer,
        });
      }

      const response = await page.goto(pageInfo.link, {
        waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        timeout: 60000,
      });

      if (response) {
        const status = response.status();
        if (status === 404 && !this.taskFinished) {
          const errorType = ErrorType.NotFound;
          this.queueTask.statistics.errorTypeCount[errorType] += 1;
          await closePage(page);
          if ('onNotFound' in request && request?.onNotFound)
            request.onNotFound();
          return { status: 'not-found', retries };
        }
        if (status === 429 && !this.taskFinished) {
          throw new Error(ErrorType.RateLimit);
        }
        if (status >= 500 && !this.taskFinished) {
          throw new Error(ErrorType.ServerError);
        }
      }

      const blocked = await checkForBlockingSignals(
        page,
        false,
        shop.mimic,
        pageInfo.link,
        this.queueTask,
      );

      if (blocked) {
        throw new Error(ErrorType.AccessDenied);
      }
      await task(page, request);
      return { status: 'page-completed', retries };
    } catch (error) {
      if (!this.taskFinished) {
        if (!this.repairing) {
          if (error instanceof Error) {
            if (
              error.message === ErrorType.RateLimit ||
              error.message === ErrorType.AccessDenied ||
              error.message === ErrorType.ServerError
            ) {
              if (this.criticalErrorCount > MAX_CRITICAL_ERRORS) {
                this.pauseQueue('error');
              } else {
                const errorType = error.message as ErrorType;
                this.queueTask.statistics.errorTypeCount[errorType] += 1;
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
              this.queueTask.statistics.errorTypeCount[errorType] += 1;
              this.pauseQueue('error');
            }
            const errorType = this.parseError(error);
            if (errorType) {
              this.queueTask.statistics.errorTypeCount[errorType] += 1;
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
            this.queueTask.statistics.errorTypeCount[errorType] += 1;
          }
        }
        if (page) await closePage(page);
        this.pushTask(task, { ...request, retries: retries + 1 });
        return { status: 'error-handled', retries };
      }
    } finally {
      if (page) await closePage(page);
      this.clearTimeout(id);
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

  pushTask(task: Task, request: T) {
    this.queue.push({ task, request });
    this.next();
  }

  next(): void {
    if (
      this.pause ||
      this.repairing ||
      this.running >= this.concurrency ||
      this.queue.length === 0
    ) {
      return;
    }
    this.running++;
    this.queue = this.queue;
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      const timeoutTime =
        Math.random() * (RANDOM_TIMEOUT_MAX - RANDOM_TIMEOUT_MIN) +
        RANDOM_TIMEOUT_MIN;

      const id = crypto.randomBytes(8).toString('hex');
      const timeout = createLabeledTimeout(
        () =>
          this.wrapperFunction(nextRequest.task, nextRequest.request, id).then(
            (result: WrapperFunctionResponse) => {
              console.log(
                `status: ${result?.status}, retries: ${result?.retries}}`,
              );
              if (result) {
                const { retries, status } = result;
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
              this.running--;
              this.next();
            },
          ),
        timeoutTime,
        id,
      );
      this.timeouts.push(timeout);
    }
  }
}
