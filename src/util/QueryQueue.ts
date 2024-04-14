import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../types/proxyAuth';
import { mainBrowser } from './browsers';
import { ShopObject } from '../types';
import { ProductRecord } from '../types/product';
import { ICategory } from './getCategories';
import { checkForBlockingSignals } from '../checkPageHealth';
import { Query } from '../types/query';
import { closePage } from './closePage';
import { shuffle } from 'underscore';
import { getPage } from './getPage';
import { QueueTask } from '../types/QueueTask';
import { LoggerService } from './logger';

export interface QueryRequest {
  prio: number;
  retries: number;
  shop: ShopObject;
  query: Query;
  pageInfo: ICategory;
  addProduct: (product: ProductRecord) => Promise<void>;
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

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
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

  pauseQueue(reason: 'error' | 'rate-limit' | 'blocked') {
    if (this.pause) return;
    this.pause = true;
    if (reason === 'rate-limit' || reason === 'blocked') {
      this.repair().then(() => {
        setTimeout(() => {
          randomTimeoutmin = randomTimeoutDefaultmin;
          randomTimeoutmax = randomTimeoutDefaultmax;
          this.running = 0;
          this.resumeQueue();
        }, 5000);
      });
    }
    if (reason === 'error') {
      this.repair().then(() => {
        setTimeout(() => {
          this.resumeQueue();
        }, 5000);
      });
    }
  }

  public async clearQueue() {
    await this.disconnect(true);
    this.queue = [];
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
    this.log('disconnecting');
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
      this.log('Could not close all pages');
    }
    try {
      if (this.browser?.connected) {
        await this.browser.close();
      }
    } catch (error) {
      this.log('Could not restart browser');
    }
  }

  async connect(): Promise<void> {
    try {
      this.log('connecting');
      this.browser = await mainBrowser(this.queueTask, this.proxyAuth);
    } catch (error) {
      this.log(`Browser crashed big time  ${error}`);
      await this.repair();
    }
  }

  async repair(): Promise<void> {
    if (this.repairing) {
      this.log('already reparing');
      await new Promise<void>((resolve) =>
        this.waitingForRepairResolvers.push(resolve),
      );
      return;
    }
    this.repairing = true;
    this.log('start repairing');
    await this.disconnect();
    try {
      await this.connect();
    } catch (error) {
      throw new Error('Cannot restart browser');
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
      );
      await page
        .goto(pageInfo.link, {
          waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
          timeout: 60000,
        })
        .then((response) => {
          if (response) {
            const status = response.status();
            if (status === 429) {
              this.pauseQueue('rate-limit');
              closePage(page).then();
              !this.taskFinished &&
                this.queue.push({
                  task,
                  request: { ...request, retries: request.retries + 1 },
                });
            }
            if (status >= 500) {
              this.pauseQueue('error');
              closePage(page).then();
              !this.taskFinished &&
                this.queue.push({
                  task,
                  request: { ...request, retries: request.retries + 1 },
                });
            }
          }
        })
        .catch((e) => {
          !this.taskFinished &&
          this.log({
            location: 'Page.goTo',
            msg: e?.message,
            stack: e?.stack,
            link: pageInfo.link,
          });
          if (
            e.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR') &&
            !this.taskFinished
          ) {
            this.pauseQueue('blocked');
          }
          if (
            e.message.includes('net::ERR_TUNNEL_CONNECTION_FAILED') &&
            !this.taskFinished
          ) {
            this.pauseQueue('error');
          }
          closePage(page).then();
          !this.taskFinished &&
            this.queue.push({
              task,
              request: { ...request, retries: request.retries + 1 },
            });
        });

      // Clear cookies
      const cookies = await page.cookies();
      await page.deleteCookie(...cookies).catch((e) => {});

      // Clear localStorage and sessionStorage
      await page
        .evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        })
        .catch((e) => {});

      const blocked = await checkForBlockingSignals(page, shop.mimic, pageInfo.link, this.queueTask);

      if (blocked) {
        this.pauseQueue('blocked');
        await closePage(page);
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }
      const monitoringInterval = setInterval(async () => {
        const blocked = await checkForBlockingSignals(page, request.shop.mimic, pageInfo.link, this.queueTask);
        if (blocked) {
          this.pauseQueue('blocked');
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
      if (error instanceof Error)
        !this.taskFinished && this.log({
          location: 'PageloadCatchBlock',
          msg: error?.message,
          stack: error?.stack,
          link: pageInfo.link,
        });

      !this.taskFinished &&
        !this.browser?.connected &&
        this.pauseQueue('error');

      !this.taskFinished &&
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
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
      const timeout =
        Math.random() * (randomTimeoutmax - randomTimeoutmin) +
        randomTimeoutmin;
      // setTimeout(() => {
      this.wrapperFunction(nextRequest.task, nextRequest.request).then(
        (page) => {
          this.running--;
          this.next();
        },
      );
      // }, timeout);
    }
  }
}
