import { QueryAction } from './queryActions';
import { QueryURLSchema } from './query';
import { Detail, ProductList } from './productList';
import { Categories } from './categories';
import { CrawlAction } from './crawlActions';
import { ICategory } from '../util/crawl/getCategories';
import { Rule } from './rules';
import { PaginationElement } from './paginationElement';
import { ImgMeta } from '.';
import { ProxyType } from './proxyAuth';
import { ErrorTypes } from '../util.services/queue/ErrorTypes';
import { PuppeteerLifeCycleEvent } from 'rebrowser-puppeteer';

export interface PageErrors {
  text: string;
  sel: string;
  errorType: ErrorTypes;
}

export interface Shop {
  mimic?: string;
  d: string; // domain
  l?: string; // link to shop
  ne?: string; // name
  purlschema?: string;
  allowedHosts?: string[];
  fetch?: boolean; // fetch with get
  javascript?: {
    webWorker: status;
    serviceWorker: status;
    sharedWorker: status;
    webSocket?: status;
  };
  resourceTypes: {
    product?: ResourceTypes[];
    crawl: ResourceTypes[];
  };
  csp?: boolean;
  entryPoints: EntryPoint[];
  leaveDomainAsIs?: boolean;
  waitUntil: WaitUntil;
  kws?: string[]; // keywords
  ap?: string[]; // anti pattern
  ece?: string[]; // escape characters
  proxyType: ProxyType;
  active: boolean; // shop is active
  lastCrawlAt?: string;
  lastSelectorTestAt?: string;

  /*                      QUERY                            */

  actions?: QueryAction[];
  queryActions?: QueryAction[];
  queryUrlSchema?: QueryURLSchema[];

  /*                      CRAWL                            */

  productList: ProductList[];
  categories: Categories;
  crawlActions: CrawlAction[];
  exceptions?: string[];
  manualCategories?: ICategory[];
  rules?: Rule[];
  pageErrors?: PageErrors[];
  category?: string[];
  pauseOnProductPage?: { pause: boolean; max: number; min: number };
  paginationEl: PaginationElement[];
  imgMeta?: ImgMeta;

  /*               PRODUCT DETAIL LOOKUP                    */

  product: Detail[];
  /*                  PRODUCT DETAILS                       */
  hasEan: boolean;
  f?: string;
  n?: string; // product name
  p?: string[]; // price
  a?: string; // availability
  ean?: string; //  EAN
  sku?: string; // SKU
  mku?: string; // MKU
  img?: string[]; // image
  s?: {
    gp: number; // Grundpreis Versand
    fs: number; // Minimum Order Free shipping
    wr: number; // Prescription free shipping if wr = 0
  };
  pzn?: string; // PZN
  ps?: string; //package size
  m?: string; //manufactuerer name
}

export type status = 'enabled' | 'disabled';

export type ResourceTypes =
  | 'image'
  | 'script'
  | 'document'
  | 'stylesheet'
  | 'media'
  | 'font'
  | 'texttrack'
  | 'xhr'
  | 'fetch'
  | 'prefetch'
  | 'eventsource'
  | 'websocket'
  | 'manifest'
  | 'signedexchange'
  | 'ping'
  | 'cspviolationreport'
  | 'preflight'
  | 'other';

export interface EntryPoint {
  url: string;
  category: string;
}

export interface WaitUntil {
  product: PuppeteerLifeCycleEvent;
  entryPoint: PuppeteerLifeCycleEvent;
}
