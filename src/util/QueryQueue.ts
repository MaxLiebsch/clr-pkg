import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../types/proxyAuth';
import { mainBrowser } from './browsers';
import { DbProduct, ProductRecord } from '../types/product';
import { checkForBlockingSignals } from '../checkPageHealth';
import { closePage } from './closePage';
import { shuffle } from 'underscore';
import { getPage } from './getPage';
import { QueueTask } from '../types/QueueTask';
import { LoggerService } from './logger';
import { ErrorLog, isErrorFrequent } from './isErrorFrequent';
import { QueryRequest } from '../types/query-request';

export interface ProdInfo {
  procProd: DbProduct;
  rawProd: ProductRecord;
  dscrptnSegments: string[];
  nmSubSegments: string[];
}

type Task = (page: Page, request: QueryRequest) => Promise<void>;

const timeoutmin = 1 * 30 * 1000;
const timeoutmax = 2 * 60 * 1000;

const maxRetries = 10;

let randomTimeoutDefaultmin = 100;
let randomTimeoutDefaultmax = 500;

let randomTimeoutmin = 100;
let randomTimeoutmax = 500;

export class QueryQueue {
  private queue: Array<{
    task: Task;
    request: QueryRequest;
  }>;
  private running: number;
  private queueTask: QueueTask;
  private concurrency: number;
  private browser: Browser | null = null;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private taskFinished: boolean = false;
  private pause: boolean = false;
  private errorLog: ErrorLog;
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.errorLog = {
      'Navigating frame was detached': { count: 0, lastOccurred: null },
      'Requesting main frame too early!': { count: 0, lastOccurred: null },
      'net::ERR_TIMED_OUT': { count: 0, lastOccurred: null },
    };
    this.queueTask = task;
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
  }

  async log(msg: string | { [key: string]: any }) {
    let message = {
      shopDomain: this.queueTask.shopDomain,
      taskid: this.queueTask.id ?? '',
      type: this.queueTask.type,
      msg: '',
    };
    if (typeof msg === 'string') {
      message['msg'] = msg;
    } else {
      message = { ...message, ...msg };
    }
    LoggerService.getSingleton().logger.info(message);
  }

  pauseQueue(
    reason: 'error' | 'rate-limit' | 'blocked',
    error: string,
    link: string,
  ) {
    if (this.pause) return;
    this.log({ location: 'pauseQueue', reason, link });
    this.pause = true;
    if (reason === 'rate-limit' || reason === 'blocked') {
      this.repair(reason).then(() => {
        setTimeout(() => {
          randomTimeoutmin = randomTimeoutDefaultmin;
          randomTimeoutmax = randomTimeoutDefaultmax;
          this.running = 0;
          this.resumeQueue();
        }, 5000);
      });
    }
    if (reason === 'error') {
      this.repair(reason).then(() => {
        setTimeout(() => {
          this.resumeQueue();
        }, 5000);
      });
    }
    this.errorLog['Navigating frame was detached'].count = 0;
    this.errorLog['Navigating frame was detached'].lastOccurred = null;
    this.errorLog['Requesting main frame too early!'].count = 0;
    this.errorLog['Requesting main frame too early!'].lastOccurred = null;
    this.errorLog['net::ERR_TIMED_OUT'].count = 0;
    this.errorLog['net::ERR_TIMED_OUT'].lastOccurred = null;
  }

  public async clearQueue() {
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
    const concurrent = this.concurrency - this.running;
    for (let index = 0; index <= concurrent; index++) {
      this.next();
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

  async connect(reason?: string): Promise<void> {
    try {
      this.log({ msg: 'connecting', reason });
      this.browser = await mainBrowser(this.queueTask, this.proxyAuth);
    } catch (error) {
      this.log(`Browser crashed big time  ${error}`);
      await this.repair(`Browser crashed big time  ${error}`);
    }
  }

  async repair(reason?: string): Promise<void> {
    if (this.repairing) {
      this.log({ msg: 'already reparing', reason });
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
      this.log({ msg: 'start repairing', reason });
    } catch (error) {
      this.log({ msg: 'Cannot restart browser', reason });
    }
    this.running = 0;
    this.repairing = false;
    this.waitingForRepairResolvers.forEach((resolve) => resolve());
    this.waitingForRepairResolvers = [];
  }

  idle() {
    return {
      pages: this.queue.length,
      idle: this.queue.length > 0,
    };
  }

  connected() {
    return this.browser?.connected;
  }

  public workload() {
    return this.queue.length;
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

  linkExists(newLink: string) {
    return this.uniqueLinks.some((link) => link === newLink);
  }

  private async wrapperFunction(
    task: Task,
    request: QueryRequest,
  ): Promise<Page | undefined> {
    if (request.retries >= maxRetries) return;

    const { pageInfo, shop } = request;
    const { waitUntil, resourceTypes } = shop;

    this.uniqueLinks.push(pageInfo.link);

    try {
      const page = await getPage(
        this.browser!,
        this.proxyAuth,
        resourceTypes?.query,
        shop.exceptions,
        shop.rules,
      );
      const response = await page
        .goto(pageInfo.link, {
          waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
          timeout: 60000,
        })
        .catch(async (e) => {
          if (!this.taskFinished) {
            this.log({
              location: 'Page.goTo',
              msg: e?.message,
              stack: e?.stack,
              repairing: this.repairing,
              pause: this.pause,
              connected: this.browser?.connected,
              link: pageInfo.link,
            });

            if (e.message.includes('Navigating frame was detached')) {
              let errorType = 'Navigating frame was detached';
              this.errorLog[errorType].count += 1;
              this.errorLog[errorType].lastOccurred = Date.now();

              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue(
                  'error',
                  'Navigating frame was detached',
                  pageInfo.link,
                );
              }
            }

            if (e.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
              this.pauseQueue(
                'blocked',
                'net::ERR_HTTP2_PROTOCOL_ERROR',
                pageInfo.link,
              );
            }
            
            if (e.message.includes('net::ERR_TUNNEL_CONNECTION_FAILED')) {
              this.pauseQueue(
                'error',
                'net::ERR_TUNNEL_CONNECTION_FAILED',
                pageInfo.link,
              );
            }

            if (e.message.includes('net::ERR_TIMED_OUT')) {
              let errorType = 'net::ERR_TIMED_OUT';
              this.errorLog[errorType].count += 1;
              this.errorLog[errorType].lastOccurred = Date.now();

              if (isErrorFrequent(errorType, 1000, this.errorLog)) {
                this.pauseQueue('error', 'net::ERR_TIMED_OUT', pageInfo.link);
              }
            }

            this.queue.push({
              task,
              request: { ...request, retries: request.retries + 1 },
            });
            await closePage(page);
          }
        });

      if (response) {
        const status = response.status();
        if(status === 404){
          await closePage(page)
          if(request?.onNotFound) request.onNotFound()
          return;
        }
        if (status === 429 && !this.taskFinished) {
          this.pauseQueue('rate-limit', 'status:429', pageInfo.link);
          await closePage(page)
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        }
        if (status >= 500 && !this.taskFinished) {
          this.pauseQueue('error', 'status:500', pageInfo.link);
          await closePage(page)
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        }
      }

      // Clear cookies
      const cookies = await page.cookies().catch((e) => {});
      if (cookies) await page.deleteCookie(...cookies).catch((e) => {});

      // Clear localStorage and sessionStorage
      await page
        .evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        })
        .catch((e) => {});

      const blocked = await checkForBlockingSignals(
        page,
        shop.mimic,
        pageInfo.link,
        this.queueTask,
      );

      if (blocked) {
        this.pauseQueue(
          'blocked',
          'after page load:mimic,access denied',
          pageInfo.link,
        );
        await closePage(page);
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }
      const monitoringInterval = setInterval(async () => {
        const blocked = await checkForBlockingSignals(
          page,
          request.shop.mimic,
          pageInfo.link,
          this.queueTask,
        );
        if (blocked) {
          this.pauseQueue(
            'blocked',
            'in Interval: mimic,access denied',
            pageInfo.link,
          );
          clearInterval(monitoringInterval);
          await closePage(page);
          if (request.retries < maxRetries) {
            this.queue.push({
              task,
              request: { ...request, retries: request.retries + 1 },
            });
          }
        }
      }, 10000);

      await task(page, request);
      clearInterval(monitoringInterval);
      return page;
    } catch (error) {
      if (!this.taskFinished) {
        if (error instanceof Error) {
          this.log({
            location: 'PageloadCatchBlock',
            msg: error?.message,
            pause: this.pause,
            repairing: this.repairing,
            connected: this.browser?.connected,
            stack: error?.stack,
            link: pageInfo.link,
          });

          // if (error.message.includes('Requesting main frame too early!')) {
          //   let errorType = 'Requesting main frame too early!';
          //   this.errorLog[errorType].count += 1;
          //   this.errorLog[errorType].lastOccurred = Date.now();

          //   if (isErrorFrequent(errorType, 1000, this.errorLog)) {
          //     this.pauseQueue('error');
          //   }
          // }
        }

        if (!this.browser?.connected && !this.repairing)
          this.pauseQueue(
            'error',
            error instanceof Error ? error?.message : 'No Instance of Error',
            pageInfo.link,
          );

        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }
    }
  }

  // Push a new task to the queue
  pushTask(task: Task, request: QueryRequest) {
    this.queue.push({ task, request });
    this.next();
  }

  // Process the next task
  private next() {
    if (
      this.pause ||
      this.repairing ||
      this.running >= this.concurrency ||
      this.queue.length === 0
    ) {
      return;
    }
    this.running++;
    const nextRequest = this.queue.shift();
    this.queue = shuffle(this.queue);
    if (nextRequest) {
      const timeoutTime =
        Math.random() * (randomTimeoutmax - randomTimeoutmin) +
        randomTimeoutmin;
      this.wrapperFunction(nextRequest.task, nextRequest.request).then(
        (page) => {
          this.running--;
          this.next();
        },
      );
    }
  }
}
