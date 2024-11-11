import { DbProductRecord } from '../types/DbProductRecord';
import {
  AznPlatform,
  EbyPlatform,
  ProductCore,
  SourceInfo,
} from '../types/product';
import { CProduct } from './CProduct';
import {
  CrawlEanProps,
  LookupCategoryProps,
  LookupInfoProps,
  QueryEansOnEbyProps,
} from '../types/process';

export class ProductFacotry {
  static createFromApi(apiData: DbProductRecord): CProduct {
    const aznInitialized = apiData.a_prc && apiData.asin && apiData.costs?.azn;
    const ebyInitialized =
      apiData.e_prc && apiData.esin && apiData.cat_prop === 'complete';

    const core: ProductCore = {
      id: apiData._id,
      eanList: apiData.eanList || [],
      status: {
        eby: ebyInitialized ? 'complete' : 'new',
        azn: aznInitialized ? 'complete' : 'new',
      },
      processProps: {
        quantityChecked: null,
        nameChecked: null,
        azn: {
          deal: null,
          noDeal: null,
        },
        eby: {
          deal: null,
          noDeal: null,
        },
        lookupInfo: null,
        queryEansOnEby: null,
        lookupCategory: null,
        scrapeEan: null,
      },
    };

    const {
      info_prop,
      ean_prop,
      eby_prop,
      cat_prop,
      dealAznUpdatedAt,
      aznUpdatedAt,
      dealEbyUpdatedAt,
      ebyUpdatedAt,
      nm_vrfd,
      nm_v,
      nm_updatedAt,
      qty_v,
      qty_updatedAt,
    } = apiData;

    if (nm_vrfd && nm_v && nm_updatedAt) {
      core.processProps.nameChecked = {
        updatedAt: nm_updatedAt,
        version: nm_v,
      };
    }

    if (qty_updatedAt && qty_v) {
      core.processProps.quantityChecked = {
        updatedAt: qty_updatedAt,
        version: qty_v,
      };
    }

    if (info_prop) {
      core.processProps.lookupInfo = {
        status: info_prop as LookupInfoProps,
        updatedAt: apiData.infoUpdatedAt || '',
      };
    }

    if (ean_prop) {
      core.processProps.scrapeEan = {
        status: ean_prop as CrawlEanProps,
        updatedAt: apiData.keepaEanUpdatedAt || '',
      };
    }

    if (eby_prop) {
      core.processProps.queryEansOnEby = {
        status: eby_prop as QueryEansOnEbyProps,
        updatedAt: apiData.qEbyUpdatedAt || '',
      };
    }

    if (cat_prop) {
      core.processProps.lookupCategory = {
        status: cat_prop as LookupCategoryProps,
        updatedAt: apiData.catUpdatedAt || '',
      };
    }

    if (dealAznUpdatedAt) {
      core.processProps.azn.deal = {
        updatedAt: dealAznUpdatedAt,
      };
    }
    if (aznUpdatedAt) {
      core.processProps.azn.noDeal = {
        updatedAt: aznUpdatedAt,
      };
    }

    if (dealEbyUpdatedAt) {
      core.processProps.eby.deal = {
        updatedAt: dealEbyUpdatedAt,
      };
    }

    if (ebyUpdatedAt) {
      core.processProps.eby.noDeal = {
        updatedAt: ebyUpdatedAt,
      };
    }

    // source info

    const sourceInfo: SourceInfo = {
      domain: apiData.sdmn,
      category: apiData.ctgry || [],
      link: apiData.lnk,
      image: apiData.img,
      availibility: apiData.a,
      name: apiData.nm,
      currency: apiData.cur,
      price: apiData.prc,
      unitPrice: apiData.uprc,
      quantity: apiData.qty,
      manufacturer: apiData.mnfctr,
      sku: apiData.sku,
      hasManufacturer: apiData.hasMnfctr,
    };

    // azn platform

    const azn: AznPlatform = {
      published: Boolean(apiData.a_pblsh),
      price: apiData.a_prc,
      unitPirce: apiData.a_uprc,
      asin: apiData.asin,
      currency: apiData.a_cur,
      sellerRank: apiData.bsr || [],
      arbitrage: {
        a_mrgn: apiData.a_mrgn,
        a_mrgn_pct: apiData.a_mrgn_pct,
        a_w_mrgn: apiData.a_w_mrgn,
        a_w_mrgn_pct: apiData.a_w_mrgn_pct,
        a_p_w_mrgn: apiData.a_p_w_mrgn,
        a_p_w_mrgn_pct: apiData.a_p_w_mrgn_pct,
        a_p_mrgn: apiData.a_p_mrgn,
      },
      keepaProperties: {
        categories: apiData.categories,
        k_eanList: apiData.k_eanList,
        brand: apiData.brand,
        iwhd: apiData.iwhd,
        cmpPrcThrshld: apiData.cmpPrcThrshld,
        drops30: apiData.drops30,
        drops90: apiData.drops90,
        pwhd: apiData.pwhd,
        costs: apiData.costs,
        numberOfItems: apiData.numberOfItems,
        a_qty: apiData.a_qty,
        availabilityAmazon: apiData.availabilityAmazon,
        categoryTree: apiData.categoryTree,
        salesRanks: apiData.salesRanks,
        monthlySold: apiData.monthlySold,
        ahstprcs: apiData.ahstprcs,
        anhstprcs: apiData.anhstprcs,
        auhstprcs: apiData.auhstprcs,
        curr_ahsprcs: apiData.curr_ahsprcs,
        curr_ansprcs: apiData.curr_ansprcs,
        curr_ausprcs: apiData.curr_ausprcs,
        curr_salesRank: apiData.curr_salesRank,
        avg30_ahsprcs: apiData.avg30_ahsprcs,
        avg30_ansprcs: apiData.avg30_ansprcs,
        avg30_ausprcs: apiData.avg30_ausprcs,
        avg30_salesRank: apiData.avg30_salesRank,
        avg90_ahsprcs: apiData.avg90_ahsprcs,
        avg90_ansprcs: apiData.avg90_ansprcs,
        avg90_ausprcs: apiData.avg90_ausprcs,
        avg90_salesRank: apiData.avg90_salesRank,
        buyBoxIsAmazon: apiData.buyBoxIsAmazon,
        stockAmount: apiData.stockAmount,
        stockBuyBox: apiData.stockBuyBox,
        totalOfferCount: apiData.totalOfferCount,
      },
    };

    // eby platform

    const eby: EbyPlatform = {
      published: Boolean(apiData.e_pblsh),
      price: apiData.e_prc,
      unitPrice: apiData.e_uprc,
      quantity: apiData.e_qty,
      esin: apiData.esin,
      costs: {
        withShop: apiData.e_costs,
        withoutShop: apiData.e_ns_costs,
        tax: apiData.e_tax,
      },
      arbitrage: {
        e_mrgn_prc: apiData.e_mrgn_prc,
        e_mrgn_pct: apiData.e_mrgn_pct,
        e_ns_mrgn: apiData.e_ns_mrgn,
        e_ns_mrgn_pct: apiData.e_ns_mrgn_pct,
      },
    };

    return new CProduct(core, sourceInfo, eby, azn);
  }
}
