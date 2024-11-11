import { ObjectId } from 'mongodb';
import {
  CrawlEanProps,
  LookupCategoryProps,
  LookupInfoProps,
  QueryEansOnEbyProps,
} from './process';
import {
  BSR,
  Costs,
  Dimensions,
  EbyCategory,
  KeepaProperties,
  Prange,
  Verification,
} from './DbProductRecord';

export interface ProductCore {
  id: ObjectId;
  eanList: string[];
  status: {
    eby: 'complete' | 'incomplete' | 'new';
    azn: 'complete' | 'incomplete' | 'new';
  };
  processProps: {
    quantityChecked: { updatedAt: string; version: string } | null;
    nameChecked: { updatedAt: string; version: string } | null;
    azn: {
      deal: { updatedAt: string } | null;
      noDeal: { updatedAt: string } | null;
    };
    eby: {
      deal: { updatedAt: string } | null;
      noDeal: { updatedAt: string } | null;
    };
    lookupInfo: { status: LookupInfoProps; updatedAt: string } | null;
    queryEansOnEby: { status: QueryEansOnEbyProps; updatedAt: string } | null;
    lookupCategory: { status: LookupCategoryProps; updatedAt: string } | null;
    scrapeEan: { status: CrawlEanProps; updatedAt: string } | null;
  };
}

export interface SourceInfo {
  domain: string; // sdmn
  category: string[]; // ctgry
  link: string; // lnk
  image: string; // img
  availibility: string; // a
  name: string; // nm
  currency?: string; // curr
  price: number; //prc
  unitPrice: number; // uprc
  quantity: number; // qty
  manufacturer?: string; // mnfctr
  sku?: string;
  hasManufacturer: boolean; // hasMnfctr
  nm_vrfd?: Verification;
}

export interface AznPlatform {
  published?: boolean; // a_pblsh
  price?: number; // a_prc
  unitPirce?: number; // a_uprc
  asin?: string;
  currency?: string; // a_curr
  quantity?: number; // a_qty
  costs?: Costs; // costs
  gl?: string; // gl Product group name
  totalOffers?: number; // a_totalOfferCounts
  vrfd?: Verification; // a_vrfd
  itemDimensions?: Dimensions; // iwhd
  packageDimensions?: Dimensions; // pwhd
  tRexId?: string; // For category matching
  a_orgn?: string;
  tax?: number; // tax
  useListingPrice?: boolean; // a_useCurrPrice
  rating?: number; // a_rating
  reviews?: number; // a_reviews
  sellerRank: BSR[]; // bsr
  a_errors?: string[];
  arbitrage: {
    a_mrgn?: number;
    a_mrgn_pct?: number;
    a_w_mrgn?: number;
    a_w_mrgn_pct?: number;
    a_p_w_mrgn?: number;
    a_p_w_mrgn_pct?: number;
    a_p_mrgn?: number;
  };
  keepaProperties: KeepaProperties;
}

export interface EbyPlatform {
  published?: boolean; // e_pblsh
  price?: number; // e_prc
  unitPrice?: number; // e_uprc
  quantity?: number; // e_qty
  esin?: string;
  vrfd?: Verification; // e_vrfd
  ebayCategories?: EbyCategory[];
  totalOffers?: number; // e_totalOfferCounts
  priceRange?: Prange;
  costs: {
    withShop?: number; // e_costs
    withoutShop?: number; // e_ns_costs
    tax?: number; // e_tax taxes of the ebay listing
  };
  arbitrage: {
    e_mrgn_prc?: number;
    e_mrgn_pct?: number;
    e_ns_mrgn?: number;
    e_ns_mrgn_pct?: number;
  };
}
