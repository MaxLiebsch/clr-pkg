import { BaseQueue } from './BaseQueue';
import { CrawlerQueue } from './CrawlerQueue';
import { QueryQueue } from './QueryQueue';

export function* yieldQueues(
  queues: QueryQueue[] | CrawlerQueue[],
): Generator<BaseQueue<any>> {
  let index = 0;
  while (true) {
    yield queues[index];
    index = (index + 1) % queues.length;
  }
}
