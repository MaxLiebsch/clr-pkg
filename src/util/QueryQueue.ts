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

export class QueryQueue {
  private queue: Array<{
    task: Task;
    request: QueryRequest;
  }>;
  private running: number;
  private concurrency: number;
  private browser: Browser | null = null;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private waitingForRepairResolvers: (() => void)[] = [];
  private blockedPages: number = 0;
  private pause: boolean = false;

  constructor(concurrency: number, proxyAuth: ProxyAuth) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
  }

  pauseQueue(reason: 'error' | 'rate-limit' | 'blocked') {
    if (this.pause) return;

    this.pause = true;
    const startTime = Date.now();
    if (reason === 'rate-limit' || reason === 'blocked') {
      const interval = setInterval(() => {
        console.log('waiting...', Math.floor((Date.now() - startTime) / 1000));
      }, 5000);
      const timeout = Math.random() * (timeoutmax - timeoutmin) + timeoutmin;
      setTimeout(
        () => {
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
        },
        timeout,
      );
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

  async disconnect(): Promise<void> {
    try {
      this.browser && (await this.browser.close());
    } catch (error) {
      console.log('Could not restart browser');
    }
  }

  async connect(): Promise<void> {
    try {
      this.browser = await mainBrowser(this.proxyAuth);
    } catch (error) {
      console.log('Browser crashed big time', error);
      await this.repair();
      this.browser = await mainBrowser(this.proxyAuth);
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

  public workload(){
    return this.queue.length
  }

  async browserHealth() {
    const pages = await this.browser?.pages().catch((e) => {});
    let urls: string[] = [];
    let numberOfPages = 0;
    if (pages) {
      urls = pages.map((page) => {
        try {
          const url = page.url();
          if (url.includes('chrome://new-tab-page/')) {
            closePage(page).then();
          }
          return url;
        } catch (error) {
          console.log('error:', error);
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

  
  // async blockChecker() {
  //   this.blockedPages += 1;
  //   if (this.blockedPages >= 5) {
  //     this.repair().then(() => {
  //       this.blockedPages = 0;
  //     });
  //   }
  // }

  private async wrapperFunction(
    task: Task,
    request: QueryRequest,
  ): Promise<Page | undefined> {
    const maxRetries = 3;

    if (request.retries >= maxRetries) return;

    const { pageInfo, shop } = request;
    const { waitUntil, resourceTypes } = shop;

    this.uniqueLinks.push(pageInfo.link);

    try {
      const page = await getPage(
        this.browser!,
        this.proxyAuth,
        resourceTypes?.query,
      );
      await page
        .goto(pageInfo.link, {
          waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
        })
        .then((response) => {
          if (response) {
            const status = response.status();
             if (status === 429) {
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
      console.log('BROWSER PAGE LOAD FAILED', error);
      !this.browser?.connected && this.pauseQueue('error');
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
    if (this.pause ||
      this.repairing || this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    this.running++;
    const nextRequest = this.queue.shift();
    this.queue = shuffle(this.queue)
    if (nextRequest) {
      this.wrapperFunction(nextRequest.task, nextRequest.request).then(
        (page) => {
          this.running--;
          this.next();
        },
      );
    }
  }
}
