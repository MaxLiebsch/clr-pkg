import { ProxyType } from './proxyAuth';

export type TaskTypes =
  | 'DEALS_ON_EBY'
  | 'DEALS_ON_AZN'
  | 'DAILY_SALES'
  | 'CRAWL_SHOP'
  | 'WHOLESALE_SEARCH'
  | 'SCAN_SHOP'
  | 'MATCH_PRODUCTS'
  | 'CRAWL_AZN_LISTINGS'
  | 'CRAWL_EBY_LISTINGS'
  | 'CRAWL_EAN'
  | 'LOOKUP_INFO'
  | 'QUERY_EANS_EBY'
  | 'LOOKUP_CATEGORY';

export interface QueueTask {
  [key: string]: any;
  id: string;
  type: TaskTypes;
  productLimit: number;
  proxyType?: ProxyType;
  timezones?: string[];
  statistics: {
    proxyTypes: { [key in ProxyType]: number };
    visitedPages: string[];
    errorTypeCount: {
      [key: string]: number;
    };
    estimatedProducts: number;
    statusHeuristic: {
      'error-handled': number;
      'page-completed': number;
      'not-found': number;
      'limit-reached': number;
      total: number;
    };
    retriesHeuristic: {
      '0': number;
      '1-9': number;
      '10-49': number;
      '50-99': number;
      '100-499': number;
      '500+': number;
    };
    resetedSession: number;
    browserStarts: number;
  };
}
