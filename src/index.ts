import mongoose from 'mongoose';

export * from './constants/index';

// SCHEMAS
export * from './schemas/manufactuerer';
export * from './schemas/shop';
export * from './schemas/medication';
export * from './schemas/performance';

//TYPES
export * from './types/index';
export * from './types/status'

export * from './util/queryURLBuilder'
export * from './util/extract/index';
export * from './util/sanitize/index';
export * from './util/dbOperations';
export * from './util/helpers';
export * from './util/extractProductAvailabilityInfo';
export * from './util/deliveryTImeCleansing';
export * from './util/logger';
export * from './util/fs/stats';
export * from './util/normalizeSIUnits'
export * from "./util/matching/compare_helper"

// BROWSER
export * from './util/browser/browsers';
export * from './util/browser/getPage';

// QUERY
export * from './util.services/query/submitQuery';
export * from './util.services/query/queryShop';
export * from './util.services/query/queryShopQueue';
export * from "./util.services/query/queryTargetShop";
export * from './util/query/lookupProductQueue';
export * from './util/query/matchTargetShopProdsWithRawProd';

//QUEUE
export * from './util/queue/CrawlerQueue';
export * from './util/queue/QueryQueue';

// CRAWL
export * from './util.services/crawl/crawlShop';
export * from './util.services/crawl/crawlSubpage'
export * from './util/crawl/browseProductPages';
export * from './util/crawl/paginationURLBuilder';



export const mg = { mongoose };
