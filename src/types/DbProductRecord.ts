import { WithId } from 'mongodb';

export type Content =
  | 'link'
  | 'price'
  | 'mnfctr'
  | 'cur'
  | 's_hash'
  | 'hasMnfctr'
  | 'promoPrice'
  | 'van'
  | 'instock'
  | 'nmSub'
  | 'asin'
  | 'mpn'
  | 'bsr'
  | 'sellerRank'
  | 'categories'
  | 'sku'
  | 'mku'
  | 'a_'
  | 'ean'
  | 'a_img'
  | 'eanList'
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
  | 'a_prc'
  | 'year'
  | 'totalOfferCount'
  | 'buyBoxIsAmazon'
  | 'a_rating'
  | 'a_reviewcnt'
  | 'costs.azn'
  | 'costs.varc'
  | 'tax'
  | 'costs.tpt'
  | 'costs.strg.1_hy'
  | 'costs.strg.2_hy'
  | 'a_prc_test_1'
  | 'a_prc_test_2'
  | 'a_prc_test_3'
  | 'e_prc';

export interface Product {
  createdAt?: string;
  updatedAt?: string;
  matchedAt?: string;
  link: string;
  image: string;
  name: string;
  vendor?: string;
  vendorLink?: string;
  promoPrice?: string;
  price: number;
  category?: string[];
  description?: string;
  shop?: string;
  nameSub?: string;
  year?: string;
  prime: boolean;
}

export interface CandidateProduct extends Product {
  nameSegments: string[];
}

export interface SrcProductDetails {
  nm: string;
  nmSubSegments: string[];
  prc: number;
  dscrptnSegments: string[];
  mnfctr: string;
}

export type ProductRecord = Partial<
  Record<Content, string | boolean | Array<string> | number>
>;

export interface DbProduct {
  eanList: string[];
  cur?: string;
  sdmn: string;
  qty_v?: string;
  mku?: string;
  qty_updatedAt?: string;
  nm_v?: string;
  nm_updatedAt?: string;
  ctgry: string[];
  mnfctr: string;
  sku?: string;
  hasMnfctr: boolean;
  nm: string;
  a: string;
  nm_vrfd?: Verification;
  matched?: boolean;
  img: string;
  lnk: string;
  qty: number;
  uprc: number;
  prc: number;
  s_hash: string;
  ean_taskId?: string;
  eanUpdatedAt?: string;
  ean_prop?: string;
  nm_batchId?: string;
  nm_prop?: string;
  qty_batchId?: string;
  qty_prop?: string;

  createdAt: string;
  shop?: string;
  updatedAt: string;
}

export interface BSR {
  category: string;
  number: number;
  createdAt: string;
}

export interface Costs {
  prvsn?: number;
  tpt: number;
  dfltTpt?: boolean;
  estmtd?: boolean;
  ktpt?: number; // keepa transport fee per units
  varc: number;
  azn: number;
  noStrgFee?: boolean;
  strg_1_hy: number;
  strg_2_hy: number;
}

export interface Verification {
  vrfd?: boolean;
  isMatch?: boolean;
  qty?: number;
  nm_prop?: string;
  qty_prop?: string;
  qty_score?: number;
  score?: number;
  vrfn_pending?: boolean;
  flags?: string[];
  flag_cnt?: number;
}

export type Prange = {
  min: number;
  max: number;
  median: number;
};

export interface EbyCategory {
  category: string;
  id: number;
  createdAt?: string;
}

export type AznProps =
  | 'a_pblsh'
  | 'a_nm'
  | 'a_lnk'
  | 'a_img'
  | 'asin'
  | 'a_prc'
  | 'a_errors'
  | 'costs'
  | 'gl'
  | 'drops30'
  | 'drops90'
  | 'iwhd'
  | 'pwhd'
  | 'a_uprc'
  | 'a_qty'
  | 'a_orgn'
  | 'tax'
  | 'a_useCurrPrice'
  | 'a_reviewcnt'
  | 'a_rating'
  | 'a_mrgn'
  | 'a_mrgn_pct'
  | 'a_w_mrgn'
  | 'a_w_mrgn_pct'
  | 'a_p_w_mrgn'
  | 'a_p_w_mrgn_pct'
  | 'a_p_mrgn'
  | 'a_vrfd'
  | 'a_p_mrgn_pct'
  | 'info_taskId'
  | 'info_prop'
  | 'keepaEanUpdatedAt'
  | 'keepaEan_lckd'
  | 'keepaUpdatedAt'
  | 'keepa_lckd'
  | 'aznUpdatedAt'
  | 'azn_prop'
  | 'azn_taskId'
  | 'dealAznUpdatedAt'
  | 'dealAznTaskId';

export interface Dimensions {
  height: number;
  length: number;
  width: number;
  weight?: number;
}

export interface AznProduct {
  availUpdatedAt?: string;
  // AZN properties
  a_pblsh?: Boolean;
  a_nm?: string;
  a_lnk?: string;
  drops30?: number;
  drops90?: number;
  a_cur?: string;
  a_errors?: string[];
  a_img?: string;
  gl?: string;
  asin?: string;
  a_prc?: number;
  costs?: Costs;
  iwhd?: Dimensions;
  pwhd?: Dimensions;
  a_uprc?: number;
  bsr?: BSR[];
  a_qty?: number;
  tRexId?: string;
  a_orgn?: string;
  a_reviewcnt?: number;
  a_rating?: number;
  tax?: number;
  a_mrgn?: number;
  a_useCurrPrice?: boolean;
  a_mrgn_pct?: number;
  a_w_mrgn?: number;
  a_w_mrgn_pct?: number;
  a_p_w_mrgn?: number;
  a_p_w_mrgn_pct?: number;
  a_p_mrgn?: number;
  a_vrfd?: Verification;
  a_p_mrgn_pct?: number;
  // lookup info
  info_taskId?: string;
  infoUpdatedAt?: string;
  info_prop?: string;
  // keepa properties
  keepaEanUpdatedAt?: string;
  keepaEan_lckd?: boolean;
  keepaUpdatedAt?: string;
  keepa_lckd?: boolean;
  // scrape listing
  aznUpdatedAt?: string;
  azn_taskId?: string;
  azn_prop?: string;
  // dealazn properties
  dealAznUpdatedAt?: string;
  dealAznTaskId?: string;
}

export type EbyProps =
  | 'e_pblsh'
  | 'e_nm'
  | 'e_pRange'
  | 'e_cur'
  | 'e_img'
  | 'esin'
  | 'e_prc'
  | 'e_uprc'
  | 'e_qty'
  | 'e_orgn'
  | 'e_mrgn'
  | 'e_mrgn_prc'
  | 'e_mrgn_pct'
  | 'e_ns_costs'
  | 'e_ns_mrgn'
  | 'e_ns_mrgn_prc'
  | 'e_ns_mrgn_pct'
  | 'e_tax'
  | 'e_costs'
  | 'e_totalOfferCount'
  | 'ebyCategories'
  | 'e_vrfd'
  | 'cat_taskId'
  | 'ebyUpdatedAt'
  | 'eby_taskId'
  | 'dealEbyUpdatedAt'
  | 'dealEbyTaskId'
  | 'eby_prop'
  | 'qEbyUpdatedAt'
  | 'cat_prop'
  | 'catUpdatedAt';

export type AvgPrices =
  | 'avg30_buyBoxPrice'
  | 'avg30_ansprcs'
  | 'avg30_ahsprcs'
  | 'avg90_buyBoxPrice'
  | 'avg90_ansprcs'
  | 'avg90_ahsprcs'

export const AVG_PRICES: {[key in AvgPrices]:AvgPrices} = {
  avg30_buyBoxPrice: 'avg30_buyBoxPrice',
  avg30_ansprcs: 'avg30_ansprcs',
  avg30_ahsprcs: 'avg30_ahsprcs',
  avg90_buyBoxPrice: 'avg90_buyBoxPrice',
  avg90_ansprcs: 'avg90_ansprcs',
  avg90_ahsprcs: 'avg90_ahsprcs',
}

export interface KeepaProperties {
  categories?: number[] | null;
  k_eanList?: string[];
  brand?: string;
  iwhd?: Dimensions;
  cmpPrcThrshld?: number;
  drops30?: number;
  costs?: Costs;
  drops90?: number;
  pwhd?: Dimensions;
  existingCosts?: Costs;
  numberOfItems?: number; // numberOfItems === a_qty
  a_qty?: number; // numberOfItems === a_qty
  availabilityAmazon?: string;
  categoryTree?: { name: string; catId: number }[] | null;
  salesRanks?: { [key: string]: number[][] } | null; // Sales Rank nullable
  monthlySold?: number;
  ahstprcs?: number[][]; // Amazon history prices
  anhstprcs?: number[][]; // Amazon new history prices
  auhstprcs?: number[][]; // Amazon used history prices
  curr_ahsprcs?: number;
  curr_ansprcs?: number;
  curr_ausprcs?: number;
  curr_salesRank?: number;
  curr_buyBoxPrice?: number;
  curr_fba?: number;
  a_avg_fld?: AvgPrices | null;
  a_avg_price?: number;
  avg30_ahsprcs?: number; // Average of the Amazon history prices of the last 30 days
  avg30_ansprcs?: number; // Average of the Amazon history prices of the last 30 days
  avg30_ausprcs?: number; // Average of the Amazon history prices of the last 30 days
  avg30_salesRank?: number; // Average of the Amazon history prices of the last 30 days
  avg30_buyBoxPrice?: number; // Average of the Amazon history prices of the last 30 days
  avg30_fba?: number; // Average of the lowest fba history prices of the last 30 days
  avg90_ahsprcs?: number; // Average of the Amazon history prices of the last 90 days
  avg90_ansprcs?: number; // Average of the Amazon history prices of the last 90 days
  avg90_ausprcs?: number; // Average of the Amazon history prices of the last 90 days
  avg90_salesRank?: number; // Average of the Amazon history prices of the last 90 days
  avg90_fba?: number; // Average of the lowest fba history prices of the last 90 days
  avg90_buyBoxPrice?: number; // Average of the Amazon history prices of the last
  buyBoxIsAmazon?: boolean;
  stockAmount?: number; //  The stock of the Amazon offer, if available. Otherwise undefined.
  stockBuyBox?: string; // he stock of the buy box offer, if available. Otherwise undefined.
  totalOfferCount?: number;
} // The total count of offers for this product (all conditions combined). The offer count per condition can be found in the current field.

export interface DbProductRecord
  extends KeepaProperties,
    WithId<Document>,
    DbProduct,
    AznProduct {
  availUpdatedAt?: string;

  // Eby properties
  e_pblsh?: boolean;
  e_nm?: string;
  e_pRange?: Prange;
  e_lnk?: string;
  e_cur?: string;
  e_img?: string;
  esin?: string;
  e_prc?: number;
  e_uprc?: number;
  e_qty?: number;
  e_orgn?: string;
  e_mrgn?: number;
  e_totalOfferCount?: number;
  e_totalSoldOfferCount?: number;
  e_mrgn_prc?: number;
  e_mrgn_pct?: number;
  e_ns_costs?: number;
  e_ns_mrgn?: number;
  e_ns_mrgn_pct?: number;
  e_tax?: number;
  e_costs?: number;
  ebyCategories?: EbyCategory[];
  e_vrfd?: Verification;
  // lookup category
  cat_taskId?: string;
  // scrape listing
  ebyUpdatedAt?: string;
  eby_taskId?: string;
  // dealeby properties
  dealEbyUpdatedAt?: string;
  dealEbyTaskId?: string;

  eby_prop?: string;
  qEbyUpdatedAt?: string;

  cat_prop?: string;
  catUpdatedAt?: string;
}
