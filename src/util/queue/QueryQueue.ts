import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../../types/proxyAuth';
import { DbProduct, ProductRecord } from '../../types/product';
import { shuffle } from 'underscore';
import { QueueTask } from '../../types/QueueTask';
import { QueryRequest } from '../../types/query-request';
import { BaseQueue } from './BaseQueue';

export interface ProdInfo {
  procProd: DbProduct;
  rawProd: ProductRecord;
  dscrptnSegments: string[];
  nmSubSegments: string[];
}

type Task = (page: Page, request: QueryRequest) => Promise<void>;

let randomTimeoutmin = 100;
let randomTimeoutmax = 500;

export class QueryQueue {
  private queue: Array<{
    task: Task;
    request: QueryRequest;
  }>;
  private running: number;
  private concurrency: number;
  private browser: Browser | null = null;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private pause: boolean = false;
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.queueTask = task;
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
  }
  /* LOGGING */
  async log(msg: string | { [key: string]: any }) {
    return BaseQueue.prototype.log.call(this, msg);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  async connect(reason?: string): Promise<void> {
    return await BaseQueue.prototype.connect.call(this, reason);
  }
  async disconnect(taskFinished = false): Promise<void> {
    return await BaseQueue.prototype.disconnect.call(this, taskFinished);
  }
  async browserHealth() {
    return await BaseQueue.prototype.browserHealth.call(this);
  }
  connected() {
    return this.browser?.connected;
  }
  /*  QUEUE RELATED FUNCTIONS  */
  private async wrapperFunction(
    task: Task,
    request: QueryRequest,
  ): Promise<Page | undefined> {
    return await BaseQueue.prototype.wrapperFunction.call(this, task, request);
  }
  private pauseQueue(
    reason: 'error' | 'rate-limit' | 'blocked',
    error: string,
    link: string,
  ) {
    return BaseQueue.prototype.pauseQueue.call(this, reason, error, link);
  }

  public async clearQueue() {
    return await BaseQueue.prototype.clearQueue.call(this);
  }
  public idle() {
    return BaseQueue.prototype.idle.call(this);
  }
  public workload() {
    return BaseQueue.prototype.workload.call(this);
  }

  // Push a new task to the queue
  public pushTask(task: Task, request: QueryRequest) {
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

Object.assign(QueryQueue.prototype, BaseQueue<QueryRequest>);
