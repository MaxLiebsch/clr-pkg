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
} from '../../constants';
import { yieldBrowserVersion } from '../../util/browser/yieldBrowserVersion';
import { Versions } from '../../util/versionProvider';

type Task = (page: Page, request: any) => Promise<void>;

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
        resetedSession: 0,
        errorTypeCount,
        browserStarts: 0,
        openedPages: 0,
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
    const { errorTypeCount, browserStarts, openedPages, resetedSession } =
      this.queueTask.statistics;
    this.log({
      ...errorTypeCount,
      browserStarts,
      openedPages,
      resetedSession,
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
  ): Promise<Page | undefined> {
    if (request.retries >= MAX_RETRIES) return;

    let { pageInfo, shop } = request;
    pageInfo.link = prefixLink(pageInfo.link, shop.d);

    const { waitUntil, resourceTypes } = shop;

    this.uniqueLinks.push(pageInfo.link);
    this.queueTask.statistics.openedPages += 1;
    let page: Page | undefined = undefined;

    try {
      page = await getPage(
        this.browser!,
        this.requestCount,
        resourceTypes?.query,
        shop.exceptions,
        shop.rules,
      );

      const response = await page.goto(pageInfo.link, {
        waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        timeout: 60000,
      });

      if (response) {
        const status = response.status();
        if (status === 404) {
          const errorType = ErrorType.NotFound;
          this.queueTask.statistics.errorTypeCount[errorType] += 1;
          await closePage(page);
          if ('onNotFound' in request && request?.onNotFound)
            request.onNotFound();
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
      console.log('Page after task:', page);
      return page;
    } catch (error) {
      console.log('Error in wrapperFunction:', error);
      console.log(
        'Page in catch block:',
        page,
        'Curr Request Cnt:',
        this.requestCount,
        'Reseted Session: ',
        this.queueTask.statistics.resetedSession,
      );
      if (!this.taskFinished) {
        if (!this.repairing) {
          if (error instanceof Error) {
            if (
              error.message === ErrorType.RateLimit ||
              error.message === ErrorType.AccessDenied ||
              error.message === ErrorType.ServerError
            ) {
              if (this.criticalErrorCount > MAX_CRITICAL_ERRORS) {
                this.criticalErrorCount = 0;
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
                  console.log('reseting session');
                  this.criticalErrorCount += 1;
                  this.requestCount += 1;
                  page && (await this.resetCookies(page));
                } else {
                  this.errorLog[errorType].count += 1;
                  this.errorLog[errorType].lastOccurred = Date.now();
                }
              }
            }
            if (`${error}`.includes('Protocol error')) {
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
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }
    } finally {
      if (page) {
        await closePage(page);
      }
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
            (page) => {
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
