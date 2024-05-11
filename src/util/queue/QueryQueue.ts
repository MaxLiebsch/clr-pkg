import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../../types/proxyAuth';
import { DbProduct, ProductRecord } from '../../types/product';
import { shuffle } from 'underscore';
import { QueueTask } from '../../types/QueueTask';
import { QueryRequest } from '../../types/query-request';
import { BaseQueue } from './BaseQueue';
import { ErrorLog } from '../isErrorFrequent';
import { errorTypes } from './ErrorTypes';
import { createLabeledTimeout } from '../createLabeledTimeout';

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
  /*
   Placeholder variables for interoperability with BaseQueue class

  */
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private waitingForRepairResolvers: (() => void)[] = [];
  private errorLog: ErrorLog;
  /*
    if the timeouts need to be applied later
  */
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];
  private running: number;
  private concurrency: number;
  private browser: Browser | null = null;
  private repairing: Boolean = false;
  private pause: boolean = false;
  public taskFinished: boolean = false;

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.errorLog = errorTypes;
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
  connected() {
    return BaseQueue.prototype.connected.call(this);
  }
  async browserHealth() {
    return await BaseQueue.prototype.browserHealth.call(this);
  }
  async repair(reason?: string): Promise<void> {
    return BaseQueue.prototype.repair.call(this, reason);
  }
  /*  QUEUE RELATED FUNCTIONS  */
  /*  Placeholder  function for interoperability with BaseQueue class */
  public async clearQueue() {
    return await BaseQueue.prototype.clearQueue.call(this);
  }
  private resumeQueue() {
    return BaseQueue.prototype.resumeQueue.call(this);
  }
  private pauseQueue(
    reason: 'error' | 'rate-limit' | 'blocked',
    error: string,
    link: string,
    location: string,
  ) {
    return BaseQueue.prototype.pauseQueue.call(
      this,
      reason,
      error,
      link,
      location,
    );
  }
  public idle() {
    return BaseQueue.prototype.idle.call(this);
  }
  public workload() {
    return BaseQueue.prototype.workload.call(this);
  }
  private async wrapperFunction(
    task: Task,
    request: QueryRequest,
  ): Promise<Page | undefined> {
    return await BaseQueue.prototype.wrapperFunction.call(this, task, request);
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
      const timeout = createLabeledTimeout(
        () =>
          this.wrapperFunction(nextRequest.task, nextRequest.request).then(
            (page) => {
              this.running--;
              this.next();
            },
          ),
        timeoutTime,
      );
      this.timeouts.push(timeout);
    }
  }
}

Object.assign(QueryQueue.prototype, BaseQueue<QueryRequest>);
