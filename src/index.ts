import mongoose from 'mongoose';
import { getProductInfoWithFetch } from './util/extract/getProductInfoWithFetch';

export * from './constants/index';

// SCHEMAS
export * from './schemas/manufactuerer';
export * from './schemas/shop';
export * from './schemas/medication';
export * from './schemas/performance';

//TYPES
export * from './types/index';
export * from './types/status';

export * from './util/queryURLBuilder';
export * from './util/extract/index';
export * from './util/sanitize/index';
export * from './util/dbOperations';
export * from './util/helpers';
export * from './util/safeParsePrice';
export * from './util/extractProductAvailabilityInfo';
export * from './util/deliveryTImeCleansing';
export * from './util/logger';
export * from './util/fs/stats';
export * from './util/matching/normalizeSIUnits';
export * from './util/matching/compare_helper';
export * from './util/matching/calculateArbitrage';
export * from './util/matching/calculateAznArbitrage';
export * from './util/matching/calculateEbyArbitrage';
export * from './util/matching/parseEbyCategories';
export * from './util/matching/generateUpdate';
export * from './util/browser/yieldBrowserVersion';
export * from './static/allowed';
export * from './static/blocked';
export * from './static/ebay';

// BROWSER
export * from './util/browser/browsers';
export * from './util/browser/getPage';

// SCAN
export * from './util.services/queue/ScanQueue';
export * from './util.services/scan/scanShop';

// QUERY
export * from './util.services/query/submitQuery';
export * from './util.services/query/queryShop';
export * from './util.services/query/queryShopQueue';
export * from './util.services/query/queryTargetShop';
export * from './util.services/query/queryEansOnEbyQueue';
export * from './util/query/lookupProductQueue';
export * from './util/query/queryProductPageQueue';
export * from './util/query/querySellerInfosQueue';
export * from './util/query/matchTargetShopProdsWithRawProd';

//QUEUE
export * from './util.services/queue/CrawlerQueue';
export * from './util.services/queue/QueryQueue';
export * from './util.services/queue/yieldQueues';
export * from './util.services/queue/checkForBlockingSignals';

// CRAWL
export * from './util.services/crawl/crawlShop';
export * from './util.services/crawl/crawlSubpage';
export * from './util/crawl/browseProductPages';
export * from './util/crawl/paginationURLBuilder';
export * from './util/crawl/getCategories';
export * from './util/crawl/getPageNumberFromPagination';
export * from './util/crawl/findPagination';
export * from './util/crawl/crawlProducts';
export * from './util/crawl/browseProductPagesQueue';
export * from './util/extract/getProductInfoWithFetch';

export const mg = { mongoose };
