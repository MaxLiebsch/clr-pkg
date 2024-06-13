import { TargetShop } from '../../types';
import { DbProduct, Product } from '../../types/product';
import { ProdInfo } from '../../util.services/queue/QueryQueue';
import {
  addBestMatchToProduct,
  segmentFoundProds,
} from '../matching/compare_helper';

export type ProductOriginPath =
  | 'bm_v_self_vendor_search_all'
  | 'bm_v_catch_all_search_all'
  | 'bm_v_m_amazon'
  | 'bm_v_m_ebay'
  | 'hp_search_all'
  | 'hp_found_all'
  | 'hp_m_amazon'
  | 'hp_m_ebay'
  | 'no_bm_search_all'
  | 'wtf';

export interface IntermediateProdInfo {
  intermProcProd: DbProduct;
  candidates: Candidate[];
  missingShops: TargetShop[];
  path: ProductOriginPath;
}

export interface TargetShopProducts {
  products?: Product[];
  procProd?: DbProduct;
  candidates?: { [key: string]: Candidate[] } | Candidate[];
  targetShop: TargetShop;
  path: ProductOriginPath;
}

interface Candidate {
  nm: string;
  nmSegments: string[];
  prc: number;
  lnk: string;
}

export const matchTargetShopProdsWithRawProd = (
  targetShopProducts: TargetShopProducts[],
  prodInfo: ProdInfo,
) => {
  let { procProd } = prodInfo;
  const candidates: { [key: string]: Candidate[] } = {};

  targetShopProducts.forEach(({ products, targetShop }) => {
    if (products && products.length) {
      const { foundProds, candidatesToSave } =
        reduceTargetShopCandidates(products);

      candidates[targetShop.d] = candidatesToSave;
      const { arbitrage, bestMatch } = addBestMatchToProduct(
        foundProds,
        targetShop,
        prodInfo,
      );
      procProd = { ...procProd, ...arbitrage.arbitrage };
    }
  });
  return { procProd, candidates };
};

export const reduceTargetShopCandidates = (products: Product[]) => {
  const foundProds = segmentFoundProds(
    products.filter((p) => p.price && p.link && p.name),
  );

  const candidatesToSave = foundProds.map((candidate) => {
    const { nameSegments: nmSegments, link: lnk, name: nm, vendor } = candidate;
    return {
      vendor: vendor || '',
      nm,
      lnk,
      nmSegments,
      prc: candidate.price,
    };
  });
  return { foundProds, candidatesToSave };
};
