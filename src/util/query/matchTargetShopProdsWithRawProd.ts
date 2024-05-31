import { TargetShop } from '../../types';
import { DbProduct, Product, } from '../../types/product';
import { ProdInfo } from '../../util.services/queue/QueryQueue';
import { 
  addBestMatchToProduct,
  segmentFoundProds,
} from '../matching/compare_helper';

export interface IntermediateProdInfo {
  intermProcProd: DbProduct;
  candidates: Candidate[] 
  targetShops: TargetShop[];
}

export interface TargetShopProducts {
  products?: Product[];
  procProd?: DbProduct;
  candidates?: {[key: string]:Candidate[]} | Candidate[];
  targetShop: TargetShop;
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
  return { procProd, candidates};
};

export const reduceTargetShopCandidates = (products: Product[]) => {
  const foundProds = segmentFoundProds(products.filter((p) => p.price && p.link && p.name && p.image));

  const candidatesToSave = foundProds.map((candidate) => {
    const { nameSegments: nmSegments, link: lnk, name: nm } = candidate;
    return {
      nm,
      lnk,
      nmSegments,
      prc: candidate.price,
    };
  });
  return { foundProds, candidatesToSave };
};