import { Limit, ShopObject, TargetShop } from '.';
import { ProdInfo, QueryQueue } from '../util.services/queue/QueryQueue';
import { ICategory } from '../util/crawl/getCategories';
import { IntermediateProdInfo } from '../util/query/matchTargetShopProdsWithRawProd';
import { CrawlerQueue } from '../util.services/queue/CrawlerQueue';
import { ProductRecord } from './product';
import { Query } from './query';
import { ScanQueue } from '../util.services/queue/ScanQueue';

export interface QRequest {
  prio: number;
  retries: number;
  shop: ShopObject;
  pageInfo: ICategory;
}

export interface ScanRequest extends QRequest {
  parentPath: string;
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

export interface QueryRequest extends QRequest {
  queue: QueryQueue;
  addProduct: (product: ProductRecord) => Promise<void>;
  extendedLookUp?: boolean;
  targetRetailerList?: TargetShop[];
  targetShop?: TargetShop;
  prodInfo?: ProdInfo;
  limit?: Limit;
  query: Query;
  isFinished?: (interm?: IntermediateProdInfo) => Promise<void>;
  addProductInfo?: ({
    productInfo,
    url,
  }: {
    productInfo: { key: string; value: string }[] | null;
    url: string;
  }) => Promise<void>;
  onNotFound?: () => Promise<void>;
}

export interface CrawlerRequest extends QRequest {
  queue: CrawlerQueue;
  addProduct: (product: ProductRecord) => Promise<void>;
  limit: Limit;
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
