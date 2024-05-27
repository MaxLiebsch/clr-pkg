import { ChildProcess } from 'child_process';
import { ObjectId } from 'mongodb';
import mongoose, { Query, Schema } from 'mongoose';
import { Browser, PuppeteerLifeCycleEvent } from 'puppeteer1';
import { QueryKeys } from './query';
import { ICategory } from '../util/crawl/getCategories';
import { Rule } from './rules';

export interface ImgMeta {
  baseurl: string;
  imgRegex: string;
  suffix: string;
}

export interface WaitUntil {
  product: PuppeteerLifeCycleEvent;
  entryPoint: PuppeteerLifeCycleEvent;
}

export type ActionType =
  | 'button'
  | 'input'
  | 'select'
  | 'shadowroot-button'
  | 'recursive-button';

export interface BaseAction {
  type: ActionType;
  sel: string;
  name: string;
}

export interface ButtonAction extends BaseAction {
  action: string;
  wait: boolean;
  waitDuration?: number;
  target?: string;
  btn_sel?: string;
}

export interface recursiveButtonAction extends BaseAction {
  action: string;
  wait: boolean;
  waitDuration?: number;
  target?: string;
  btn_sel?: string;
}

export interface SelectAction extends BaseAction {
  what: QueryKeys;
  wait: boolean;
}
export interface InputAction extends BaseAction {
  what: QueryKeys[];
  wait: boolean;
}

export type QueryAction =
  | ButtonAction
  | SelectAction
  | InputAction
  | recursiveButtonAction;

export type CrawlAction = QueryAction;

export interface Limit {
  mainCategory: number;
  subCategory: number;
  pages: number;
}

export interface Categories {
  sel: string;
  exclude: string[];
  wait?: number;
  categoryNameSegmentPos?: number;
  categoryRegexp?: string;
  visible?: boolean;
  type: string;
  subCategories: SubCategoriesSel[];
}

export interface SubCategoriesSel {
  visible?: boolean;
  sel: string;
  type: string;
}

export interface PaginationEl {
  type: string;
  sel: string;
  nav: string;
  initialUrl?: {
    type: string;
    regexp: string;
  };
  scrollToBottom: boolean;
  paginationUrlSchema?: PaginationUrlSchema;
  calculation: Calculation;
}

export interface PaginationUrlSchema {
  replace: string;
  withQuery: boolean;
  parseAndReplace?: {
    regexp: string;
    replace: string;
  };
  calculation: {
    method: string;
    offset: number;
  };
}

export interface Calculation {
  method: string;
  last: string;
  productsPerPage?: number;
  textToMatch?: string;
  dynamic?: boolean;
  sel: string;
}

export interface ProductInfos {
  timeout?: number;
  sel: string;
  product: [type: string];
  productDetails: ProductDetailSelector[];
}

export interface ProductDetailSelector {
  content: string;
  type: string;
  sel: string;
}

export interface ProductList {
  sel: string;
  type: string;
  timeout?: number;
  productsPerPage?: number;
  productCntSel: string[];
  product: IProductSelector;
}

export interface IProductSelector {
  sel: string;
  type: string;
  details: Detail[];
}

export type Content =
  | 'link'
  | 'price'
  | 'promoPrice'
  | 'van'
  | 'vendor'
  | 'vendorLink'
  | 'name'
  | 'shop'
  | 'category'
  | 'description'
  | 'nameSub'
  | 'redirect_link'
  | 'image'
  | 'prime'
  | 'year';

export interface Detail {
  content: Content;
  sel: string;
  type: string;
  baseUrl?: string;
  extractPart?: number;
  regexp?: string;
  proprietaryProducts?: string;
  attr?: string;
  key?: string;
  redirect_regex?: string;
  urls: {
    redirect: string;
    default: string;
  };
  remove: string;
}

export interface PrimitiveAction {
  type: string;
  sel: string;
  target?: string;
}

export interface EntryPoint {
  url: string;
  category: string;
}

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

export interface QueryURLSchema {
  baseUrl: string;
  searchParams?: SearchParams;
  suffix?: string;
  category: string;
}

export interface SearchParams {
  brand?: Brand;
  continent?: string;
  queryPart?: QueryPart;
  year?: Year;
}

export interface Brand {
  key: string;
}

export interface QueryPart {
  seperator: string;
}

export interface Year {
  param: string;
  min: string;
  max: string;
}

export interface TargetShop {
  prefix: string;
  d: string;
  name: string;
}

export interface ShopObject {
  _id: string;
  mimic?: string;
  d: string; // domain
  l: string; // link to shop
  ne: string; // name
  purlschema: string;
  fetch: boolean; // fetch with get
  resourceTypes: {
    query: ResourceTypes[];
    crawl: ResourceTypes[];
  };
  entryPoints: EntryPoint[];
  waitUntil: WaitUntil;
  kws: string[]; // keywords
  ap: string[]; // anti pattern
  ece: string[]; // escape characters
  active: boolean; // shop is active
  lastCrawlAt: string;
  lastSelectorTestAt: string;

  /*                      QUERY                            */

  actions: QueryAction[];
  queryActions: QueryAction[];
  queryUrlSchema: QueryURLSchema[];

  /*                      CRAWL                            */

  productList: ProductList[];
  categories: Categories;
  crawlActions: CrawlAction[];
  exceptions?: string[];
  manualCategories: ICategory[];
  rules?: Rule[];
  category: string[];
  pauseOnProductPage?: { pause: boolean; max: number; min: number };
  paginationEl: PaginationEl[];
  imgMeta: ImgMeta;

  /*                  PRODUCT DETAILS                       */

  f?: string;
  n: string; // product name
  p: string[]; // price
  a: string; // availability
  ean: string; //  EAN
  img: string[]; // image
  s: {
    gp: number; // Grundpreis Versand
    fs: number; // Minimum Order Free shipping
    wr: number; // Prescription free shipping if wr = 0
  };
  pzn: string; // PZN
  ps: string; //package size
  m: string; //manufactuerer name
}
export interface BrowserGroup {
  [key: string]: BrowserInfo;
}
export interface BrowserInfoBase {
  status: 'failed' | 'active';
  load: number;
  openPages: number;
}

export interface BrowserInfo extends BrowserInfoBase {
  brs: Browser;
  id: string;
}

export type EVENTS =
  | 'CRAWLER_STARTED'
  | ''
  | 'CRAWLER_KILLED'
  | 'CRAWLER_ALREADY_RUNNING'
  | 'MAX_CRAWLER_REACHED'
  | 'CRAWLER_NOT_RUNNING'
  | 'CRAWLER_RESET'
  | 'CRAWLER_FAILED'
  | 'CRAWLER_COMPLETE'
  | 'CRAWLER_ABORTED'
  | 'REVERSE_SEARCH_IS_RUNNING'
  | 'REVERSE_SEARCH_STARTED'
  | 'REVERSE_SEARCH_COMPLETE'
  | 'CRAWL_ALL_STARTED'
  | 'CRAWL_ALL_RUNNING'
  | 'REVERSE_SEARCH_ALL_RUNNING'
  | 'REVERSE_SEARCH_ALL_STARTED'
  | 'DB_JOB_IS_RUNNING'
  | 'DB_JOB_STARTED';

export interface ProductInfoRequestResponse {
  url: string;
  err: boolean;
  newCandidate: Candidate;
}

export interface SearchProductWithPZNResponse {
  url: string;
  err: boolean;
  status: number;
}

export interface StartPosition {
  found: string[];
  crawled: string[];
  errored: string[];
  checked: string[];
}

export interface Statistics {
  crawled: number;
  found: number;
  pagesWithErrors: number;
  lastCrawledAt: string;
  foundProducts: number;
  shopId: string;
  shop: string;
  start: number;
  rt: number;
  rph: number;
}

export interface Candidate {
  a: string;
  p: string;
  ean: string;
  n: string;
  l: string;
  f?: string;
  img?: string[];
  m: string;
  ps: string;
  pzn: string;
  ls: string[];
}

export interface PriceAvailabilityInfo {
  a: string;
  p: string;
  n: string;
  ean: string;
  ps: string;
}

export interface FailedPage {
  url: string;
  err: boolean;
}

export interface ChildProcessInfo {
  load: number;
  cp: ChildProcess;
  aborted: boolean;
}

export interface manufactuererObj {
  n: string;
}

export interface Medication {
  pzn: string;
  _id?: ObjectId | mongoose.Types.ObjectId;
  n: string;
  m: IManufactuerer;
  slug: string;
  docs: boolean;
  published: boolean;
  size: number;
  size_uc: string;
  rating: Rating[];
  ratingAvg: number;
  mmi: boolean;
  html: string;
  createdAt: string;
  lp: string;
  ps: string;
  otc: boolean;
  ops: RelatedProducts[] | any[];
  uvp: number;
  ean: string;
  ekp: number;
  syms: string[];
  ingr: string[];
  ls: RichLink[];
}

export interface IManufactuerer {
  maker_id: ObjectId | mongoose.Types.ObjectId;
  n: string;
}
export interface RelatedProducts {
  medication_id: ObjectId | mongoose.Types.ObjectId;
  ps: string;
  n: string;
  pzn: string;
}

export interface ProductRow {
  pzn: string;
  n: string;
  published: boolean;
  foundInMMI: boolean;
  ls: [];
  ps: string;
  _id: string;
  createdAt: string;
  status: string;
  id: number;
}

export type ProductRows = Array<ProductRow>;

export interface Rating {
  sessionId: string;
  rating: number;
}

export interface ProductInfo {
  l?: string;
  p: string;
  a: string;
}

export interface RichLink {
  shopId: ObjectId | mongoose.Types.ObjectId;
  c: ProductInfo;
  updatedAt: string;
  createdAt: string;
}

export enum deliveryStatus {
  l0 = 'sofort lieferbar',
  l1 = 'eingeschränkt lieferbar',
  l2 = 'nicht lieferbar',
}

export type Operations =
  | 'DELETE_ALL_PRODUCTS_FROM_SHOP'
  | 'UPDATE_PRODUCTS'
  | 'REWRITE_DOCUMENTS';

// export interface Medication {
//   data: Datum[];
// }

export interface Datum {
  _id: string;
  pzn: string;
  syms: null;
  ps: string;
  ean: string;
  ingr: null;
  ops: any[];
  otc: boolean;
  ratingAvg: number;
  lp: string;
  uvp: number;
  html: string;
  slug: string;
  n: string;
  m: M[];
  ls: RichLinkPopluated[];
}

export interface RichLinkPopluated {
  shopId: shopId;
  c: ProductInfo;
  updatedAt: string;
  createdAt: string;
}

export interface L2 {
  shopId: shopId;
  p: string;
  a: string;
  l: string;
  s: {
    gp: string;
    fs: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface shopId {
  _id: string;
  ne: string;
  l: string;
  s: {
    gp: number; //Grundpreis Versand
    fs: number; //Minimum Order Free shipping
    wr: number; //Prescription free shipping if wr = 0
  };
}

export interface M {
  _id: string;
  n: string;
}

export interface OtherPackageSize {
  _id: ObjectId;
  ps: string;
  ekp: number;
  uvp: number;
}
