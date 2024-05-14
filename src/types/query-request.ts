import { Limit, ShopObject, TargetShop } from ".";
import { ProdInfo, QueryQueue } from "../util/queue/QueryQueue";
import { ICategory } from "../util/crawl/getCategories";
import { IntermediateProdInfo } from "../util/query/matchTargetShopProdsWithRawProd";
import { CrawlerQueue } from "../util/queue/CrawlerQueue";
import { ProductRecord } from "./product";
import { Query } from "./query";


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
    targetShop?: TargetShop;
    prodInfo?: ProdInfo;
    limit?: Limit;
    query: Query;
    isFinished?: (interm?: IntermediateProdInfo) => Promise<void>;
    addProductInfo?: (productInfo:{key: string, value: string}[] | null) => Promise<void>;
    onNotFound?: () => Promise<void>
  }

  export interface CrawlerRequest extends QRequest {
    queue: CrawlerQueue;
    parentPath: string;
    parent: ICategory | null;
    limit: Limit;
    noOfPages?: number;
    productCount?: number | null;
    initialProductPageUrl?: string;
    pageNo?: number;
    productPagePath?: string;
    paginationType?: string;
    query?: Query;
    onlyCrawlCategories: boolean;
  }
