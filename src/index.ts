import mongoose from 'mongoose';

export * from './constants/index';

// SCHEMAS
export * from './schemas/manufactuerer';
export * from './schemas/shop';
export * from './schemas/medication';
export * from './schemas/performance';

//TYPES
export * from './types/index';
export * from './types/status';
export * from './types/proxyAuth';
export * from './types/QueueTask';
export * from './types/product';
export * from './types/shop';
export * from './types/Sitemap';
export * from './types/query-request';
export * from './types/query'
export * from './types/keepa'

export * from './util/queryURLBuilder';
export * from './util/extract/index';
export * from './util/sanitize/index';
export * from './util/dbOperations';
export * from './util/helpers';
export * from './util/getAznAvgPrice'
export * from './util/safeParsePrice';
export * from './util/getMainDomainFromUrl';
export * from './util/extract/saveParseJSON';
export * from './util/extractProductAvailabilityInfo';
export * from './util/deliveryTImeCleansing';
export * from './util/logger';
export * from './util/localLogger';
export * from './util/hash';
export * from './util/removeSearch';
export * from './util/reduceSalesRankArray';
export * from './util/uuid';
export * from './util/proxyFunctions';
export * from './util/proxyFunctionsv3';
export * from './util/fs/stats';
export * from './util/events';
export * from './util/ProcessTImeTracker';
export * from './util/parseAsinFromUrl';
export * from './util/parseEsinFromUrl';
export * from './util/transformProduct';
export * from './util/matching/normalizeSIUnits';
export * from './util/matching/compare_helper';
export * from './util/matching/packageRecognition';
export * from './util/matching/calculateArbitrage';
export * from './util/matching/calculateAznArbitrage';
export * from './util/matching/calculateEbyArbitrage';
export * from './util/matching/parseEbyCategories';
export * from './util/calculateMonthlySales';
export * from './util/matching/generateUpdate';
export * from './util/browser/yieldBrowserVersion';
export * from './static/allowed';
export * from './static/blocked';
export * from './static/ebay';

// BROWSER
export * from './util/browser/browsers';
export * from './util/browser/getPage';
export * from './util/browser/closePage'

// SCAN
export * from './util.services/queue/ScanQueue';
export * from './util.services/scan/scanShop';


// DB
export * from './util/db/aznQueries';
export * from './util/db/ebyQueries';

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
export * from "./util/crawl/buildNextPageUrl";
export * from './util/crawl/findPaginationAppendix'
export * from  './util/crawl/pagination/recursiveMoreButtonPgn';
export * from './util/crawl/pagination/scrollAndClickPgn';
export * from './util/crawl/pagination/InfinitScrollPgn';
export * from './util/crawl/getPageNumberFromPagination';
export * from './util/crawl/findPagination';
export * from './util/crawl/crawlProducts';
export * from './util/crawl/browseProductPagesQueue';
export * from './util/extract/getProductInfoWithFetch';

export const mg = { mongoose };

export * from 'mongodb';
