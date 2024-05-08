import { Browser, Page } from 'puppeteer';
import { ProxyAuth } from '../../types/proxyAuth';
import { createLabeledTimeout } from '../createLabeledTimeout';
import { QueueTask } from '../../types/QueueTask';

import { ErrorLog } from '../isErrorFrequent';
import { CrawlerRequest } from '../../types/query-request';
import { BaseQueue } from '../queue/BaseQueue';
import { errorTypes } from './ErrorTypes';

type Task = (page: Page, request: CrawlerRequest) => Promise<void>;

let randomTimeoutmin = 150;
let randomTimeoutmax = 500;

export class CrawlerQueue {
  private queue: Array<{
    task: Task;
    request: CrawlerRequest;
  }>;
  private running: number;
  private concurrency: number;
  private queueTask: QueueTask;
  private proxyAuth: ProxyAuth;
  private uniqueLinks: string[] = [];
  private repairing: Boolean = false;
  private uniqueCategoryLinks: string[] = [];
  private pause: boolean = false;
  private timeouts: { timeout: NodeJS.Timeout; id: string }[] = [];

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    this.queueTask = task;
    this.concurrency = concurrency + 1; //new page
    this.queue = [];
    this.running = 0;
    this.proxyAuth = proxyAuth;
  }
  /* LOGGING */
  async log(msg: string | { [key: string]: any }) {
    return BaseQueue.prototype.log.call(this, msg);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  async connect(): Promise<void> {
    return await BaseQueue.prototype.connect.call(this);
  }
  async disconnect(taskFinished = false): Promise<void> {
    return await BaseQueue.prototype.disconnect.call(this, taskFinished);
  }
  async browserHealth() {
    return await BaseQueue.prototype.browserHealth.call(this);
  }
  /*  CRAWLR QUEUE RELATED FUNCTIONS  */
  public addCategoryLink(categoryLink: string) {
    this.uniqueCategoryLinks.push(categoryLink);
  }
  public doesCategoryLinkExist(categoryLink: string) {
    return this.uniqueCategoryLinks.some(
      (category) => category === categoryLink,
    );
  }
  /*  QUEUE RELATED FUNCTIONS  */
  public async clearQueue() {
    return await BaseQueue.prototype.clearQueue.call(this);
  }

  private pauseQueue(
    reason: 'error' | 'rate-limit' | 'blocked',
    error: string,
    link: string,
  ) {
    return BaseQueue.prototype.pauseQueue.call(this, reason, error, link);
  }

  public idle() {
    return BaseQueue.prototype.idle.call(this);
  }
  public workload() {
    return BaseQueue.prototype.workload.call(this);
  }

  linkExists(newLink: string) {
    return this.uniqueLinks.some((link) => link === newLink);
  }

  private async wrapperFunction(
    task: Task,
    request: CrawlerRequest,
  ): Promise<Page | undefined> {
    return await BaseQueue.prototype.wrapperFunction.call(this, task, request);
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
    this.queue = this.queue;
    const nextRequest = this.queue.shift();
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

Object.assign(CrawlerQueue.prototype, BaseQueue<CrawlerRequest>);
