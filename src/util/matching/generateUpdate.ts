import { safeParsePrice } from '../safeParsePrice';
import { calculateAznArbitrage } from './calculateAznArbitrage';
import { getNumber } from './compare_helper';
import { createHash } from '../hash';
import { AddProductInfo } from '../../types/query-request';
import { Costs, DbProductRecord } from '../../types/product';
import { getAznAvgPrice } from '../getAznAvgPrice';
import { extractSellerRank } from '../extract/extractSellerRank';
import { roundToTwoDecimals } from '../helpers';
import { LookupInfoPropType } from '../../types/process';

export const generateUpdate = (
  productInfo: AddProductInfo[],
  product: DbProductRecord,
): { update: Partial<DbProductRecord>; infoProp: LookupInfoPropType } => {
  let infoProp: LookupInfoPropType = 'complete';
  let {
    prc: buyPrice,
    a_prc: existingSellPrice,
    a_qty,
    qty,
    bsr,
    asin: savedAsin,
    costs: existingCosts,
  } = product;

  a_qty = a_qty || 1;

  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });

  const a_nm = infoMap.get('name');
  const a_rating = infoMap.get('a_rating');
  const a_reviewcnt = infoMap.get('a_reviewcnt');
  const tax = infoMap.get('tax');
  const totalOfferCount = infoMap.get('totalOfferCount');
  const sellerRank = infoMap.get('sellerRank');
  const image = infoMap.get('a_img');
  const buyBoxIsAmazon = infoMap.get('buyBoxIsAmazon');
  const asin = infoMap.get('asin');
  let a_prc = safeParsePrice(infoMap.get('a_prc') || '0');

  if (savedAsin !== undefined && savedAsin !== asin) {
    throw new Error('Asin mismatch');
  }

  let update: Partial<DbProductRecord> = {
    a_nm,
    asin,
    ...(a_rating && { a_rating: safeParsePrice(a_rating) }),
    ...(a_reviewcnt && { a_reviewcnt: safeParsePrice(a_reviewcnt) }),
    ...(tax && { tax: Number(tax) }),
    ...(totalOfferCount && { totalOfferCount: getNumber(totalOfferCount) }),
    ...(image && { a_img: image }),
    ...(buyBoxIsAmazon && {
      buyBoxIsAmazon: buyBoxIsAmazon.toLowerCase().includes('amazon'),
    }),
  };

  const {
    avgPrice,
    a_useCurrPrice,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
  } = getAznAvgPrice(product, a_prc);

  update = {
    ...update,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
    a_qty,
  };

  if (!existingSellPrice || newSellPrice <= 1) {
    infoProp = 'incomplete';
  }

  const newCosts = {
    azn: safeParsePrice(infoMap.get('costs.azn') || '0'),
    varc: safeParsePrice(infoMap.get('costs.varc') || '0'),
    strg_1_hy: safeParsePrice(infoMap.get('costs.strg.1_hy') || '0'),
    strg_2_hy: safeParsePrice(infoMap.get('costs.strg.2_hy') || '0'),
    tpt: safeParsePrice(infoMap.get('costs.tpt') || '0'),
  };

  if (!existingCosts?.azn || newCosts.azn <= 0.3) {
    infoProp = 'incomplete';
  }

  if (newCosts.azn > 0.3 && newSellPrice >= 1) {
    // If we use the avg price, we need calculate the costs for the avg price,
    //but saving the costs for the current price
    const costsForCalculation = {
      ...newCosts,
    };

    if (!a_useCurrPrice) {
      costsForCalculation.azn = roundToTwoDecimals(
        (costsForCalculation.azn / a_prc) * avgPrice,
      );
    }

    // prc * (a_qty / qty)  EK*(QTY Zielshop/QTY Herkunftsshop)
    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      costsForCalculation,
      tax,
    );

    update = {
      ...update,
      ...arbitrage,
      costs: {
        ...existingCosts,
        ...newCosts,
      },
      a_useCurrPrice,
    };
  } else if (existingCosts && existingCosts.azn > 0.3 && newSellPrice >= 1) {
    // If we use the avg price, we need calculate the costs for the avg price,
    //but saving the costs for the current price
    const costsForCalculation = {
      ...existingCosts,
    };

    if (!a_useCurrPrice) {
      costsForCalculation.azn = roundToTwoDecimals(
        (costsForCalculation.azn / a_prc) * avgPrice,
      );
    }

    // prc * (a_qty / qty)  EK*(QTY Zielshop/QTY Herkunftsshop)
    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      costsForCalculation,
      tax,
    );

    update = {
      ...update,
      ...arbitrage,
      a_useCurrPrice,
    };
  }

  extractSellerRank(sellerRank, update, bsr);
  return { update, infoProp };
};

export const generateMinimalUpdate = (
  productInfo: AddProductInfo[],
  product: DbProductRecord,
): { update: Partial<DbProductRecord>; infoProp: LookupInfoPropType } => {
  let infoProp: LookupInfoPropType = 'incomplete';

  let { bsr, prc: buyPrice, a_qty, qty, costs: existingCosts, asin: savedAsin } = product;

  a_qty = a_qty || 1;

  let update: Partial<DbProductRecord> = {};

  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });
  const asin = infoMap.get('asin');

  if (savedAsin !== undefined && savedAsin !== asin) {
    throw new Error('Asin mismatch');
  }
  let a_prc = safeParsePrice(infoMap.get('a_prc') || '0');
  const tax = infoMap.get('tax');

  let newCosts: Costs = {
    azn: safeParsePrice(infoMap.get('costs.azn') || '0'),
    varc: safeParsePrice(infoMap.get('costs.varc') || '0'),
    strg_1_hy: safeParsePrice(infoMap.get('costs.strg.1_hy') || '0'),
    strg_2_hy: safeParsePrice(infoMap.get('costs.strg.2_hy') || '0'),
    tpt: safeParsePrice(infoMap.get('costs.tpt') || '0'),
  };

  const {
    avgPrice,
    a_useCurrPrice,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
  } = getAznAvgPrice(product, a_prc);

  if (newCosts.azn > 0.3 && newSellPrice >= 1) {
    // If we use the avg price, we need calculate the costs for the avg price,
    //but saving the costs for the current price
    const costsForCalculation = {
      ...newCosts,
    };
    if (!a_useCurrPrice) {
      costsForCalculation.azn = roundToTwoDecimals(
        (costsForCalculation.azn / a_prc) * avgPrice,
      );
    }

    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      costsForCalculation,
      tax,
    );
    update = {
      ...update,
      ...arbitrage,
      costs: {
        ...product.costs,
        ...newCosts,
      },
      a_useCurrPrice,
    };
  } else if (existingCosts && existingCosts.azn > 0.3 && newSellPrice >= 1) {
    if (!a_useCurrPrice) {
      existingCosts.azn = roundToTwoDecimals((existingCosts.azn / a_prc) * avgPrice);
    }

    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      existingCosts,
      tax,
    );
    update = {
      ...update,
      ...arbitrage,
      a_useCurrPrice,
    };
  }

  const totalOfferCount = infoMap.get('totalOfferCount');
  const sellerRank = infoMap.get('sellerRank');
  const image = infoMap.get('a_img');
  const buyBoxIsAmazon = infoMap.get('buyBoxIsAmazon');
  const a_nm = infoMap.get('name');
  const a_rating = infoMap.get('a_rating');
  const a_reviewcnt = infoMap.get('a_reviewcnt');
  update = {
    ...update,
    ...(newSellPrice && { a_prc: newSellPrice, a_uprc: newSellUPrice }),
    a_nm,
    asin,
    a_qty,
    ...(a_rating && { a_rating: safeParsePrice(a_rating) }),
    ...(a_reviewcnt && { a_reviewcnt: safeParsePrice(a_reviewcnt) }),
    ...(tax && { tax: Number(tax) }),
    ...(totalOfferCount && { totalOfferCount: getNumber(totalOfferCount) }),
    ...(image && { a_img: image }),
    ...(buyBoxIsAmazon && {
      buyBoxIsAmazon: buyBoxIsAmazon.toLowerCase().includes('amazon'),
    }),
  };

  extractSellerRank(sellerRank, update, bsr);
  return { update, infoProp };
};
