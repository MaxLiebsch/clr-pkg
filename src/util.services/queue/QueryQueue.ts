import { Page } from 'rebrowser-puppeteer';
import { ProxyAuth } from '../../types/proxyAuth';
import { DbProductRecord, ProductRecord } from '../../types/product';
import { QueueTask } from '../../types/QueueTask';
import { QueryRequest } from '../../types/query-request';
import { BaseQueue, WrapperFunctionResponse } from './BaseQueue';
import { Infos } from '../../types/Infos';

export interface ProdInfo {
  procProd: DbProductRecord;
  rawProd: ProductRecord;
  dscrptnSegments: string[];
  nmSubSegments: string[];
}

type Task = (page: Page, request: QueryRequest) => Promise<string | undefined | void>;

export class QueryQueue extends BaseQueue<QueryRequest> {
  /*
   Placeholder variables for interoperability with BaseQueue class

  */
  constructor(concurrency: number, proxyAuth: ProxyAuth, task: QueueTask) {
    super(concurrency, proxyAuth, task);
  }
  /* LOGGING */
  log(msg: string | { [key: string]: any }): Promise<void> {
    return super.log(msg);
  }
  /*  BROWSER RELATED FUNCTIONS  */
  connect(): Promise<void> {
    return super.connect();
  }
  disconnect(taskFinished = false): Promise<void> {
    return super.disconnect(taskFinished);
  }
  public addTasksToQueue(tasks: { task: Task; request: QueryRequest }[]) {
    return super.addTasksToQueue(tasks);
  }

  public pullTasksFromQueue() {
    return super.pullTasksFromQueue();
  }
  
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
  /*  Placeholder  function for interoperability with BaseQueue class */
  public async clearQueue(event: string, infos: Infos) {
    return await super.clearQueue(event, infos);
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
  wrapperFunction(
    task: Task,
    request: QueryRequest,
    id: string
  ): Promise<WrapperFunctionResponse> {
    return super.wrapperFunction(task, request, id);
  }

  // Push a new task to the queue
  public pushTask(task: Task, request: QueryRequest) {
    return super.pushTask(task, request);
  }
  // Process the next task
  next() {
    return super.next();
  }
}
