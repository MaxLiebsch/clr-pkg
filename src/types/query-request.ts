import { Limit, ShopObject, TargetShop } from '.';
import { ProdInfo, QueryQueue } from '../util.services/queue/QueryQueue';
import { ICategory } from '../util/crawl/getCategories';
import { IntermediateProdInfo } from '../util/query/matchTargetShopProdsWithRawProd';
import { CrawlerQueue } from '../util.services/queue/CrawlerQueue';
import { ProductRecord } from './DbProductRecord';
import { Query } from './query';
import { ScanQueue } from '../util.services/queue/ScanQueue';
import { Infos } from './Infos';
import { ProxyType } from './proxyAuth';
import { Shop } from './shop';

export interface QRequest {
  prio: number;
  retries: number;
  retriesOnFail?: number;
  requestId: string;
  prevProxyType?: ProxyType;
  proxyType: ProxyType;
  shop: Shop;
  pageInfo: ICategory;
}

export interface ScanRequest extends QRequest {
  parentPath: string;
  infos: Infos;
  queue: ScanQueue;
  categoriesHeuristic: {
    subCategories: {
      0: number;
      '1-9': number;
      '10-19': number;
      '20-29': number;
      '30-39': number;
      '40-49': number;
      '+50': number;
    };
    mainCategories: number;
  };
  productPageCountHeuristic: {
    '0': number;
    '1-9': number;
    '10-49': number;
    '+50': number;
  };
}

export interface AddProductInfo {
  key: string;
  value: string;
}

export type LookupInfoCause =
  | 'incompleteInfo'
  | 'completeInfo'
  | 'missingSellerRank'

export interface AddProductInfoProps {
  productInfo: AddProductInfo[] | null;
  url: string;
  cause?: LookupInfoCause;
}

export type NotFoundCause =
  | 'notFound'
  | 'domainNotAllowed'
  | 'timeout'
  | 'exceedsLimit';

export type OnNotFound = (cause: NotFoundCause) => Promise<void>;

export type AddProductInfoFn =  ({ productInfo, url, cause }: AddProductInfoProps) => Promise<void>

export interface QueryRequest extends QRequest {
  queue: QueryQueue;
  log?: any;
  addProduct: (product: ProductRecord) => Promise<void>;
  extendedLookUp?: boolean;
  resolveTimeout?: () => void;
  s_hash: string;
  productInfo?: AddProductInfo[];
  targetRetailerList?: TargetShop[];
  targetShop?: TargetShop;
  prodInfo?: ProdInfo;
  limit?: Limit;
  lookupRetryLimit?: number;
  query: Query;
  isFinished?: (interm?: IntermediateProdInfo) => Promise<void>;
  addProductInfo?: AddProductInfoFn;
  onNotFound?: OnNotFound;
}

export interface ScrapeRequest extends QRequest {
  queue: CrawlerQueue;
  addProduct: (product: ProductRecord) => Promise<void>;
  limit: Limit;
  updateProductLimit?: (limit: number) => void;
  categoriesHeuristic: {
    subCategories: {
      0: number;
      '1-9': number;
      '10-19': number;
      '20-29': number;
      '30-39': number;
      '40-49': number;
      '+50': number;
    };
    mainCategories: number;
  };
  productPageCountHeuristic: {
    '0': number;
    '1-9': number;
    '10-49': number;
    '+50': number;
  };
  noOfPages?: number;
  productCount?: number | null;
  initialProductPageUrl?: string;
  pageNo?: number;
  productPagePath?: string;
  paginationType?: string;
  query?: Query;
}
