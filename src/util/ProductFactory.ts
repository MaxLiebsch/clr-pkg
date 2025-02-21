import {
  AznProduct,
  DbProduct,
  DbProductRecord,
  EbyProduct,
  KeepaProperties,
} from '../types/DbProductRecord';

import { CProduct } from './CProduct';


export class ProductFactory {
  static createFromApi(apiData: DbProductRecord): CProduct {
    const core: DbProduct = {
      eanList: apiData?.eanList || [],
      cur: apiData?.cur,
      nm: apiData?.nm,
      lnk: apiData?.lnk,
      img: apiData?.img,
      // pricing
      prc: apiData?.prc,
      uprc: apiData?.uprc,
      qty: apiData?.qty,
      // manufacturer
      mnfctr: apiData?.mnfctr,
      hasMnfctr: apiData?.hasMnfctr,
      // shop domain
      sdmn: apiData?.sdmn,
      ctgry: apiData?.ctgry,

      ean_taskId: apiData?.ean_taskId,
      ean_prop: apiData?.ean_prop,
      nm_batchId: apiData?.nm_batchId,
      qty_batchId: apiData?.qty_batchId,
      nm_prop: apiData?.nm_prop,
      qty_prop: apiData?.qty_prop,
      availUpdatedAt: apiData?.availUpdatedAt,
      shop: apiData?.shop,
      // availability
      a: apiData?.a,
      s_hash: apiData?.s_hash,
      createdAt: apiData?.createdAt,
      updatedAt: apiData?.updatedAt,
    };
    const azn: AznProduct & KeepaProperties = {
      a_pblsh: apiData?.a_pblsh, // published
      asin: apiData?.asin, // asin
      a_nm: apiData?.a_nm, // name
      a_img: apiData?.a_img, // image
      a_vrfd: apiData?.a_vrfd, // verification
      // pricing
      a_prc: apiData?.a_prc,
      a_uprc: apiData?.a_uprc,
      a_cur: apiData?.a_cur,
      a_qty: apiData?.a_qty,
      //rating
      a_rating: apiData?.a_rating,
      a_reviewcnt: apiData?.a_reviewcnt,
      // best seller rank
      bsr: apiData?.bsr,
      // arbitrage
      a_avg_price: apiData?.a_avg_price, // avg price
      a_avg_fld: apiData?.a_avg_fld, // avg field
      a_mrgn: apiData?.a_mrgn,
      a_mrgn_pct: apiData?.a_mrgn_pct,
      a_w_mrgn: apiData?.a_w_mrgn,
      a_w_mrgn_pct: apiData?.a_w_mrgn_pct,
      a_p_w_mrgn: apiData?.a_p_w_mrgn,
      a_p_w_mrgn_pct: apiData?.a_p_w_mrgn_pct,
      a_p_mrgn: apiData?.a_p_mrgn,
      costs: apiData?.costs,

      // dimensions
      iwhd: apiData?.iwhd,
      pwhd: apiData?.pwhd,

      // keepa properties
      k_eanList: apiData?.k_eanList,
      categories: apiData?.categories,
      cmpPrcThrshld: apiData?.cmpPrcThrshld,
      brand: apiData?.brand,
      drops30: apiData?.drops30,
      drops90: apiData?.drops90,
      numberOfItems: apiData?.numberOfItems,
      availabilityAmazon: apiData?.availabilityAmazon,
      categoryTree: apiData?.categoryTree,
      salesRanks: apiData?.salesRanks,
      monthlySold: apiData?.monthlySold,
      ahstprcs: apiData?.ahstprcs,
      anhstprcs: apiData?.anhstprcs,
      auhstprcs: apiData?.auhstprcs,
      curr_ahsprcs: apiData?.curr_ahsprcs,
      curr_ansprcs: apiData?.curr_ansprcs,
      curr_ausprcs: apiData?.curr_ausprcs,
      curr_salesRank: apiData?.curr_salesRank,
      curr_buyBoxPrice: apiData?.curr_buyBoxPrice,
      avg30_ahsprcs: apiData?.avg30_ahsprcs,
      avg30_ansprcs: apiData?.avg30_ansprcs,
      avg30_ausprcs: apiData?.avg30_ausprcs,
      avg30_salesRank: apiData?.avg30_salesRank,
      avg30_buyBoxPrice: apiData?.avg30_buyBoxPrice,
      avg90_ahsprcs: apiData?.avg90_ahsprcs,
      avg90_ansprcs: apiData?.avg90_ansprcs,
      avg90_ausprcs: apiData?.avg90_ausprcs,
      avg90_salesRank: apiData?.avg90_salesRank,
      avg90_buyBoxPrice: apiData?.avg90_buyBoxPrice,
      buyBoxIsAmazon: apiData?.buyBoxIsAmazon,
      stockAmount: apiData?.stockAmount,
      stockBuyBox: apiData?.stockBuyBox,
      totalOfferCount: apiData?.totalOfferCount,
      keepaUpdatedAt: apiData?.keepaUpdatedAt,
    };
    const eby: EbyProduct = {
      e_pblsh: apiData?.e_pblsh,
      esin: apiData?.esin,
      e_nm: apiData?.e_nm,
      e_img: apiData?.e_img,
      ebyCategories: apiData?.ebyCategories,
      // pricing
      e_prc: apiData?.e_prc,
      e_uprc: apiData?.e_uprc,
      e_pRange: apiData?.e_pRange,
      e_qty: apiData?.e_qty,
      e_cur: apiData?.e_cur,
      e_totalOfferCount: apiData?.e_totalOfferCount,
      e_totalSoldOfferCount: apiData?.e_totalSoldOfferCount,
      // verification
      e_vrfd: apiData?.e_vrfd,
      // arbitrage
      e_costs: apiData?.e_costs,
      e_ns_costs: apiData?.e_ns_costs,
      e_tax: apiData?.e_tax,
      e_mrgn_prc: apiData?.e_mrgn_prc,
      e_mrgn_pct: apiData?.e_mrgn_pct,
      e_ns_mrgn: apiData?.e_ns_mrgn,
      e_ns_mrgn_pct: apiData?.e_ns_mrgn_pct,
      ebyUpdatedAt: apiData?.ebyUpdatedAt,

    };
    return new CProduct(core, eby, azn);
  }
}
