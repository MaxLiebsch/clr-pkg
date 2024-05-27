import { Limit, ShopObject, TargetShop } from '.';
import { ProdInfo, QueryQueue } from '../util.services/queue/QueryQueue';
import { ICategory } from '../util/crawl/getCategories';
import { IntermediateProdInfo } from '../util/query/matchTargetShopProdsWithRawProd';
import { CrawlerQueue } from '../util.services/queue/CrawlerQueue';
import { ProductRecord } from './product';
import { Query } from './query';

export interface QRequest {
  prio: number;
  retries: number;
  shop: ShopObject;
  addProduct: (product: ProductRecord) => Promise<void>;
  pageInfo: ICategory;
}

export interface QueryRequest extends QRequest {
  queue: QueryQueue;
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
  parentPath: string;
  parent: ICategory | null;
  limit: Limit;
  categoriesHeuristic: {
    subCategories: {
      0: number,
      "1-9": number,
      "10-19": number,
      "20-29": number,
      "30-39": number,
      "40-49": number,
      "+50": number,
    },
    mainCategories: number,
  }
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
  onlyCrawlCategories: boolean;
}
