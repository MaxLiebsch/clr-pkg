import { Browser, Page } from 'puppeteer';
import { getPage } from './extract';
import { ProxyAuth } from '../types/proxyAuth';
import { mainBrowser } from './browsers';
import { Limit, ShopObject } from '../types';
import { ProductRecord } from '../types/product';
import { ICategory } from './getCategories';
import { checkForBlockingSignals } from '../checkPageHealth';
import { closePage } from './closePage';
import { shuffle } from 'underscore';
import { join } from 'path';
import { slug } from '..';

export interface CrawlerRequest {
  prio: number;
  retries: number;
  shop: ShopObject;
  parentPath: string;
  parent: ICategory | null;
  limit: Limit;
  pageInfo: ICategory;
  queue: CrawlerQueue;
  onlyCrawlCategories: boolean;
  addProduct: (product: ProductRecord) => Promise<void>;
}

type Task = (page: Page, request: CrawlerRequest) => Promise<void>;

const timeoutmin = 1 * 15 * 1000;
const timeoutmax = 1 * 30 * 1000;
const maxRetries = 10;

let randomTimeoutDefaultmin = 100;
let randomTimeoutDefaultmax = 500;

let randomTimeoutmin = 100;
let randomTimeoutmax = 500;

export class CrawlerQueue {
  private queue: Array<{
    task: Task;
    request: CrawlerRequest;
  }>;
  private running: number;
  private concurrency: number;
  private browser: Browser | null = null;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private uniqueCategoryLinks: string[] = [];
  private blockedPages: number = 0;
  private pause: boolean = false;
  private lastBlock: number = 0;
  private blocks: number = 0;

  constructor(concurrency: number, proxyAuth: ProxyAuth) {
    this.concurrency = concurrency + 1; //new page
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
  }

  async disconnect(): Promise<void> {
    console.log('disconnecting');
    try {
      if (this.browser?.connected) {
        const pages = await this.browser.pages(); // Get all open pages
        // Iterate through each page and close it
        for (let page of pages) {
          await closePage(page);
        }
      }
    } catch (error) {
      console.log('Could not close all pages');
    }
    try {
      if (this.browser?.connected) {
        await this.browser.close();
      }
    } catch (error) {
      console.log('Could not restart browser');
    }
  }

  async connect(): Promise<void> {
    try {
      console.log('connecting');
      this.browser = await mainBrowser(this.proxyAuth);
    } catch (error) {
      console.log('Browser crashed big time', error);
      await this.repair();
    }
  }

  async repair(): Promise<void> {
    if (this.repairing) {
      console.log('already reparing');
      await new Promise<void>((resolve) =>
        this.waitingForRepairResolvers.push(resolve),
      );
      return;
    }
    this.repairing = true;
    console.log('start repairing');
    await this.disconnect();

    try {
      await this.connect();
    } catch (error) {
      throw new Error('Cannot restart browser');
    }
    this.repairing = false;
    this.running = 0;
    this.waitingForRepairResolvers.forEach((resolve) => resolve());
    this.waitingForRepairResolvers = [];
  }

  public addCategoryLink(categoryLink: string) {
    this.uniqueCategoryLinks.push(categoryLink);
  }

  public doesCategoryLinkExist(categoryLink: string) {
    return this.uniqueCategoryLinks.some(
      (category) => category === categoryLink,
    );
  }

  public workload() {
    return this.queue.length;
  }

  idle() {
    return {
      pages: this.queue.length,
      idle: this.queue.length > 0,
    };
  }

  async browserHealth() {
    const pages = await this.browser?.pages().catch((e) => {});
    let urls: string[] = [];
    let numberOfPages = 0;
    if (pages) {
      urls = pages.map((page) => {
        try {
          const url = page.url();
          // if (url.includes('chrome://new-tab-page/')) {
          //   closePage(page);
          // }
          return url;
        } catch (error) {
          console.log('error:', error);
          closePage(page);
          return 'failed';
        }
      });
      numberOfPages = urls.filter((url) => url !== 'failed').length;
    }
    return {
      urls,
      connected: this.browser?.connected,
      numberOfPages,
    };
  }

  linkExists(newLink: string) {
    return this.uniqueLinks.some((link) => link === newLink);
  }

  // async blockChecker() {
  //   this.blockedPages += 1;
  //   if (this.blockedPages >= 5) {
  //     this.repair().then(() => {
  //       this.blockedPages = 0;
  //     });
  //   }
  // }

  pauseQueue(reason: 'error' | 'rate-limit' | 'blocked') {
    if (this.pause) return;

    this.pause = true;
    const timeout = Math.random() * (timeoutmax - timeoutmin) + timeoutmin;
    const startTime = Date.now();

    if (reason === 'rate-limit' || reason === 'blocked') {
      const now = Date.now();
      if ((now - this.lastBlock) / 1000 < 30000) {
        console.log('now - this.lastBlock:', now - this.lastBlock);
        randomTimeoutmin = randomTimeoutmin * 1.05;
        randomTimeoutmax = randomTimeoutmax * 1.01;
      }
      if (randomTimeoutmin >= randomTimeoutmax) {
        randomTimeoutmax = randomTimeoutmax + randomTimeoutmin;
      }
      const interval = setInterval(() => {
        console.log(
          'waiting...',
          Math.floor((Date.now() - startTime) / 1000),
          ' Min Timeout: ',
          randomTimeoutmin,
          ' Max Timeout: ',
          randomTimeoutmax,
        );
      }, 10000);

      if (this.blocks === 1) {
        setTimeout(() => {
          this.repair().then(() => {
            this.blocks = 0;
            randomTimeoutmin = randomTimeoutDefaultmin;
            randomTimeoutmax = randomTimeoutDefaultmax;
            this.running = 0;
            this.resumeQueue();
            clearInterval(interval);
          });
        }, 5000);
      } else {
        setTimeout(() => {
          if (!this.browser?.connected) {
            this.connect().then(() => {
              this.running = 0;
              this.resumeQueue();
              clearInterval(interval);
            });
          } else {
            this.running = 0;
            this.resumeQueue();
            clearInterval(interval);
          }
        }, timeout);
      }
      this.blocks += 1;
      this.lastBlock = Date.now();
    }
    if (reason === 'error') {
      this.repair().then(() => {
        this.resumeQueue();
      });
    }
  }

  resumeQueue() {
    this.pause = false;
    const concurrent = this.concurrency - this.running;
    for (let index = 0; index <= concurrent; index++) {
      this.next();
    }
  }

  private async wrapperFunction(
    task: Task,
    request: CrawlerRequest,
  ): Promise<Page | undefined> {
    if (request.retries >= maxRetries) return;

    const { pageInfo, shop } = request;
    const { waitUntil, resourceTypes } = shop;

    try {
      const page = await getPage(
        this.browser!,
        this.proxyAuth,
        resourceTypes?.crawl,
      );

      page
        .goto(pageInfo.link, {
          waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        })
        .then((response) => {
          if (response) {
            const status = response.status();
            if (status === 429) {
              //after five blocks
              this.pauseQueue('rate-limit');
              closePage(page).then();
              this.queue.push({
                task,
                request: { ...request, retries: request.retries + 1 },
              });
            }
            if (status >= 500) {
              this.pauseQueue('error');
              closePage(page).then();
              this.queue.push({
                task,
                request: { ...request, retries: request.retries + 1 },
              });
            }
          }
        })
        .catch((e) => {
          if (e.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
            this.pauseQueue('blocked');
          }
          closePage(page).then();

          console.log('e:goto:', e.message);
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        });

      await page
        .waitForNavigation({
          waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        })
        .catch((e) => {
          console.log('e:wait for navigation', e.message);
          closePage(page).then();
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        });
      const blocked = await checkForBlockingSignals(page, shop.mimic);

      if (blocked) {
        this.pauseQueue('blocked');
        await closePage(page);
        this.queue.push({
          task,
          request: { ...request, retries: request.retries + 1 },
        });
      }

      const monitoringInterval = setInterval(async () => {
        const blocked = await checkForBlockingSignals(page, request.shop.mimic);
        if (blocked) {
          this.pauseQueue('blocked');
          clearInterval(monitoringInterval);
          await closePage(page);
          this.queue.push({
            task,
            request: { ...request, retries: request.retries + 1 },
          });
        }
      }, 10000);

      await task(page, request);
      clearInterval(monitoringInterval);
      return page;
    } catch (error) {
      console.log('BROWSER PAGE LOAD FAILED', error);
      !this.browser?.connected && this.pauseQueue('error');
      this.queue.push({
        task,
        request: { ...request, retries: request.retries + 1 },
      });
    }
  }

  // Push a new task to the queue
  pushTask(task: Task, request: CrawlerRequest) {
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
    this.queue = shuffle(this.queue);
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      const timeout =
        Math.random() * (randomTimeoutmax - randomTimeoutmin) +
        randomTimeoutmin;
      setTimeout(() => {
        this.wrapperFunction(nextRequest.task, nextRequest.request).then(
          (page) => {
            this.running--;
            this.next();
          },
        );
      }, timeout);
    }
  }
}
