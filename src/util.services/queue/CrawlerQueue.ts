import { Page } from 'puppeteer1';
import { ProxyAuth } from '../../types/proxyAuth';
import { QueueTask } from '../../types/QueueTask';
import { CrawlerRequest } from '../../types/query-request';
import { BaseQueue, WrapperFunctionResponse } from './BaseQueue';
import { Infos } from '../../types/Infos';

type Task = (page: Page, request: CrawlerRequest) => Promise<void>;

export class CrawlerQueue extends BaseQueue<CrawlerRequest> {
  private uniqueCategoryLinks: string[] = [];

  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    super(concurrency, proxyAuth, task);
  }
  /* LOGGING */
  log(msg: string | { [key: string]: any }) {
    return super.log(msg);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  connect(): Promise<void> {
    return super.connect();
  }
  disconnect(taskFinished = false): Promise<void> {
    return super.disconnect(taskFinished);
  }
  /* Placeholder  function for interoperability with BaseQueue class  */
  connected() {
    return super.connected();
  }
  browserHealth() {
    return super.browserHealth();
  }
  repair(reason?: string): Promise<void> {
    return super.repair(reason);
  }
  /*  QUEUE RELATED FUNCTIONS  */
  /* Placeholder  function for interoperability with BaseQueue class  */
  public clearQueue(event: string, infos: Infos) {
    return super.clearQueue(event, infos);
  }
  resumeQueue() {
    return super.resumeQueue();
  }
  pauseQueue(reason: 'error' | 'rate-limit' | 'blocked') {
    return super.pauseQueue(reason);
  }
  public idle() {
    return super.idle();
  }
  public workload() {
    return super.workload();
  }
  linkExists(newLink: string) {
    return super.linkExists(newLink);
  }
  wrapperFunction(
    task: Task,
    request: CrawlerRequest,
    id: string,
  ): Promise<WrapperFunctionResponse> {
    return super.wrapperFunction(task, request, id);
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
  // Push a new task to the queue
  pushTask(task: Task, request: CrawlerRequest) {
    return super.pushTask(task, request);
  }
  // Process the next task
  next() {
    return super.next();
  }
}
