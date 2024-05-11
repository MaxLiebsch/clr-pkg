import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../../types/proxyAuth';
import { ErrorLog, isErrorFrequent } from '../isErrorFrequent';
import { QueueTask } from '../../types/QueueTask';
import { LoggerService } from '../logger';
import { mainBrowser } from '../browsers';
import { closePage } from '../closePage';
import { CrawlerRequest, QueryRequest } from '../../types/query-request';
import { prefixLink } from '../compare_helper';
import { averageNumberOfPagesPerSession, getPage } from '../getPage';
import { checkForBlockingSignals } from '../../checkPageHealth';
import { errorTypes } from './ErrorTypes';
import { RESTART_DELAY } from '../../constants';

type Task = (page: Page, request: any) => Promise<void>;
const maxRetries = 10;

let randomTimeoutDefaultmin = 100;
let randomTimeoutDefaultmax = 500;

let randomTimeoutmin = 100;
let randomTimeoutmax = 500;

const accessDeniedError = 'AccessDenied';

export abstract class BaseQueue<T extends CrawlerRequest | QueryRequest> {
  private queue: Array<{
    task: Task;
    request: T;
  }>;
  private running: number;
  private concurrency: number;
  private browser: Browser | null = null;
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private pause: boolean = false;
  public taskFinished: boolean = false;
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];
  private errorLog: ErrorLog;
  private restartDelay: number = RESTART_DELAY
  private requestCount: number = 0;

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.errorLog = errorTypes;
    this.queueTask = task;
    this.concurrency = concurrency + 1; //new page
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
    this.resetStartDelay();
  }
  /* LOGGING */
  async log(msg: string | { [key: string]: any }) {
    let message = {
      shopDomain: this.queueTask.shopDomain,
      taskid: this.queueTask.id ?? '',
      type: this.queueTask.type,
      msg: '',
      restartDelay: this.resetStartDelay,
    };
    if (typeof msg === 'string') {
      message['msg'] = msg;
    } else {
      message = { ...message, ...msg };
    }
    LoggerService.getSingleton().logger.info(message);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  async connect(reason?: string): Promise<void> {
    try {
      this.log({ msg: 'connecting', reason });
      this.browser = await mainBrowser(this.queueTask, this.proxyAuth);
    } catch (error) {
      this.log(`Browser crashed big time  ${error}`);
      await this.repair(`Browser crashed big time  ${error}`);
    }
  }
  async disconnect(taskFinished = false): Promise<void> {
    this.log({ msg: 'disconnecting', taskFinished });
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
      this.log({ msg: 'Could not close all pages', taskFinished });
    }
    try {
      await this.browser?.close();
      this.log({ msg: 'Browser disconnected', taskFinished });
    } catch (error) {
      this.log({ msg: 'Could not restart browser', taskFinished });
    }
  }
  connected() {
    return this.browser?.connected;
  }
  async browserHealth() {
    const pages = await this.browser?.pages().catch((e) => {});
    let urls: string[] = [];
    let numberOfPages = 0;
    if (pages) {
      urls = pages.map((page) => {
        try {
          const url = page.url();
          return url;
        } catch (error) {
          this.log(`error  ${error}`);
          closePage(page).then();
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
    this.log({ msg: 'start repairing', reason });
    await this.disconnect();
    try {
      await this.connect(reason);
      this.running = 0;
      this.repairing = false;
      this.waitingForRepairResolvers.forEach((resolve) => resolve());
      this.waitingForRepairResolvers = [];
    } catch (error) {
      this.log({ msg: 'Cannot restart browser', reason });
    }
  }
  /*  QUEUE RELATED FUNCTIONS  */
  async clearQueue() {
    await this.disconnect(true);
    this.queue = [];
    this.timeouts = [];
    this.browser = null;
    this.running = 0;
    this.waitingForRepairResolvers = [];
    this.repairing = false;
  }
  resumeQueue() {
    this.pause = false;
    this.running = 0;
    for (let index = 0; index <= this.concurrency; index++) {
      setTimeout(() => this.next(), index * 1000);
    }
  }

  resetStartDelay() {
    setInterval(() => {
      if (
        this.errorLog[accessDeniedError].count > 1 &&
        !isErrorFrequent(accessDeniedError, 2 * 60000, this.errorLog)
      ) {
        this.restartDelay = RESTART_DELAY
        this.errorLog[accessDeniedError].count = 0;
        this.errorLog[accessDeniedError].lastOccurred = null;
      }
    }, 60000);
  }

  pauseQueue(
    reason: 'error' | 'rate-limit' | 'blocked',
    error: string,
    link: string,
    location: string,
  ) {
    if (this.pause) return;
    this.pause = true;

    if (reason === 'rate-limit' || reason === 'blocked') {
      if (
        //If AccessDenied error is frequent check if currentTime - lastOccurred < this.restartDelay + 1 minute
        isErrorFrequent(
          accessDeniedError,
          this.restartDelay * 60000 + 60000,
          this.errorLog,
        )
      ) {
        if (this.restartDelay < 30) {
          this.restartDelay = this.restartDelay * 2;
        }
      } else {
        this.errorLog[accessDeniedError].count += 1;
        this.errorLog[accessDeniedError].lastOccurred = Date.now();
      }

      this.repair(reason).then(() => {
        setTimeout(() => {
          randomTimeoutmin = randomTimeoutDefaultmin;
          randomTimeoutmax = randomTimeoutDefaultmax;
          this.log({
            location,
            reason,
            link,
            error,
            restarted: true,
          });
          this.resumeQueue();
        }, this.restartDelay * 60000);
      });
    }
    if (reason === 'error') {
      this.repair(reason).then(() => {
        setTimeout(() => {
          this.resumeQueue();
        }, 5000);
      });
    }
    this.log({
      location,
      reason,
      link,
      error,
    });
    // next user agent;
    this.requestCount = this.requestCount + 1;
    //Reset errors
    Object.keys(this.errorLog).forEach((key) => {
      if (key !== accessDeniedError) {
        this.errorLog[key].count = 0;
        this.errorLog[key].lastOccurred = null;
      }
    });
  }
  public idle() {
    return this.taskFinished;
  }
  public workload() {
    return this.queue.length;
  }
  async wrapperFunction(task: Task, request: T): Promise<Page | undefined> {
    if (request.retries >= maxRetries) return;

    let { pageInfo, shop } = request;
    pageInfo.link = prefixLink(pageInfo.link, shop.d);

    const { waitUntil, resourceTypes } = shop;

    this.uniqueLinks.push(pageInfo.link);

    try {
      const page = await getPage(
        this.browser!,
        this.requestCount,
        resourceTypes?.query,
        shop.exceptions,
        shop.rules,
      );
      const waitNavigation = page.waitForNavigation({ timeout: 60000 });
      const response = await page.goto(pageInfo.link, {
        waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        timeout: 60000,
      });
      await waitNavigation;

      if (response) {
        const status = response.status();
        if (status === 404) {
          await closePage(page);
          if ('onNotFound' in request && request?.onNotFound)
            request.onNotFound();
          return;
        }
        if (status === 429 && !this.taskFinished) {
          if (isErrorFrequent(accessDeniedError, 30000, this.errorLog)) {
            this.pauseQueue(
              'rate-limit',
              'status:429',
              pageInfo.link,
              'page-response',
            );
          } else {
            this.errorLog[accessDeniedError].count += 1;
            this.errorLog[accessDeniedError].lastOccurred = Date.now();
          }
          await closePage(page);
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        }
        if (status >= 500 && !this.taskFinished) {
          this.pauseQueue(
            'error',
            'status:500',
            pageInfo.link,
            'page-response',
          );
          await closePage(page);
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        }
      }

      if (this.requestCount <= averageNumberOfPagesPerSession) {
        this.requestCount += 1;
      } else {
        this.requestCount = 0;
        // Clear cookies
        const cookies = await page.cookies().catch((e) => {
          console.error('Failed to get cookies:', e);
        });
        if (cookies)
          await page.deleteCookie(...cookies).catch((e) => {
            console.error('Failed to delete cookies:', e);
          });

        // Clear localStorage and sessionStorage
        await page
          .evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          })
          .catch((e) => {
            console.error('Failed to clear storage:', e);
          });
      }

      const blocked = await checkForBlockingSignals(
        page,
        false,
        shop.mimic,
        pageInfo.link,
        this.queueTask,
      );

      if (blocked) {
        if (!this.repairing) {
          const errorType = 'AccessDenied';
          if (isErrorFrequent(errorType, 30000, this.errorLog)) {
            this.pauseQueue(
              'blocked',
              'mimic missing,access denied',
              pageInfo.link,
              'load-page',
            );
          } else {
            this.errorLog[errorType].count += 1;
            this.errorLog[errorType].lastOccurred = Date.now();
          }
        }
        await closePage(page);
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }

      await task(page, request);
      return page;
    } catch (error) {
      if (!this.taskFinished) {
        if (!this.repairing) {
          //restart browser
          if (error instanceof Error) {
            if (error.message.includes('Navigating frame was detached')) {
              let errorType = 'Navigating frame was detached';

              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue(
                  'error',
                  errorType,
                  pageInfo.link,
                  'catch-block',
                );
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }

            if (error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
              let errorType = 'net::ERR_HTTP2_PROTOCOL_ERROR';

              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue(
                  'blocked',
                  errorType,
                  pageInfo.link,
                  'catch-block',
                );
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }

            if (error.message.includes('net::ERR_TUNNEL_CONNECTION_FAILED')) {
              let errorType = 'net::ERR_TUNNEL_CONNECTION_FAILED';
              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue(
                  'error',
                  errorType,
                  pageInfo.link,
                  'catch-block',
                );
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }

            if (error.message.includes('net::ERR_TIMED_OUT')) {
              let errorType = 'net::ERR_TIMED_OUT';

              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue(
                  'error',
                  errorType,
                  pageInfo.link,
                  'catch-block',
                );
              } else {
                this.errorLog[errorType].count += 1;
                this.errorLog[errorType].lastOccurred = Date.now();
              }
            }
          } else {
            this.pauseQueue(
              'error',
              error instanceof Error ? error?.message : 'No Instance of Error',
              pageInfo.link,
              'catch-block',
            );
          }
        }
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }
    }
  }

  abstract next(): void;
}
