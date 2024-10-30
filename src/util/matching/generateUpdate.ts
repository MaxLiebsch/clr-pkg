import { safeParsePrice } from '../safeParsePrice';
import { calculateAznArbitrage } from './calculateAznArbitrage';
import { getNumber } from './compare_helper';
import { createHash } from '../hash';
import { AddProductInfo } from '../../types/query-request';
import { Costs, DbProductRecord } from '../../types/product';
import { getAznAvgPrice } from '../getAznAvgPrice';
import { extractSellerRank } from '../extract/extractSellerRank';
import { roundToTwoDecimals } from '../helpers';

export const generateUpdate = (
  productInfo: AddProductInfo[],
  product: DbProductRecord,
) => {
  let { prc: buyPrice, a_qty, qty, bsr, asin: savedAsin } = product;

  a_qty = a_qty || 1;

  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });

  const asin = infoMap.get('asin');

  if (savedAsin && savedAsin !== asin) {
    throw new Error('Asin mismatch');
  }
  
  let a_prc = safeParsePrice(infoMap.get('a_prc') || '0');

  const {
    avgPrice,
    a_useCurrPrice,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
  } = getAznAvgPrice(product, a_prc);

  if (newSellPrice <= 1) throw new Error('a_prc is 0');

  const costs = {
    azn: safeParsePrice(infoMap.get('costs.azn') || '0'),
    varc: safeParsePrice(infoMap.get('costs.varc') || '0'),
    strg_1_hy: safeParsePrice(infoMap.get('costs.strg.1_hy') || '0'),
    strg_2_hy: safeParsePrice(infoMap.get('costs.strg.2_hy') || '0'),
    tpt: safeParsePrice(infoMap.get('costs.tpt') || '0'),
  };

  if (costs.azn <= 0.3) throw new Error('costs.azn is 0');

  const a_nm = infoMap.get('name');
  const a_rating = infoMap.get('a_rating');
  const a_reviewcnt = infoMap.get('a_reviewcnt');

  const tax = infoMap.get('tax');
  const totalOfferCount = infoMap.get('totalOfferCount');

  const sellerRank = infoMap.get('sellerRank');
  const image = infoMap.get('a_img');
  const buyBoxIsAmazon = infoMap.get('buyBoxIsAmazon');
  // prc * (a_qty / qty) //EK  //QTY Zielshop/QTY Herkunftsshop
  // a_prc VK
  const arbitrage = calculateAznArbitrage(
    buyPrice * (a_qty / qty),
    a_useCurrPrice ? newSellPrice : avgPrice,
    costs,
    tax,
  );
  const a_lnk = 'https://www.amazon.de/dp/product/' + asin;
  const a_hash = createHash(a_lnk);

  const update: Partial<DbProductRecord> = {
    a_lnk,
    a_hash,
    a_nm,
    asin,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
    a_qty,
    ...(a_rating && { a_rating: safeParsePrice(a_rating) }),
    ...(a_reviewcnt && { a_reviewcnt: safeParsePrice(a_reviewcnt) }),
    ...(tax && { tax: Number(tax) }),
    ...(totalOfferCount && { totalOfferCount: getNumber(totalOfferCount) }),
    ...(image && { a_img: image }),
    ...(buyBoxIsAmazon && {
      buyBoxIsAmazon: buyBoxIsAmazon.toLowerCase().includes('amazon'),
    }),
    ...arbitrage,
    costs: {
      ...product.costs,
      ...costs,
    },
    a_useCurrPrice,
  };
  extractSellerRank(sellerRank, update, bsr);
  return update;
};

export const generateMinimalUpdate = (
  productInfo: AddProductInfo[],
  product: DbProductRecord,
) => {
  let { bsr, prc: buyPrice, a_qty, qty, costs, asin: savedAsin } = product;

  a_qty = a_qty || 1;

  let update: Partial<DbProductRecord> = {};

  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });
  const asin = infoMap.get('asin');

  if (savedAsin && savedAsin !== asin) {
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

  if (newCosts.azn > 0 && newSellPrice > 1) {
    if (!a_useCurrPrice) {
      newCosts.azn = roundToTwoDecimals((newCosts.azn / a_prc) * avgPrice);
    }

    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      newCosts,
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
  } else if (costs && costs.azn > 0 && newSellPrice > 1) {
    if (!a_useCurrPrice) {
      costs.azn = roundToTwoDecimals((costs.azn / a_prc) * avgPrice);
    }

    const arbitrage = calculateAznArbitrage(
      buyPrice * (a_qty / qty),
      a_useCurrPrice ? newSellPrice : avgPrice,
      costs,
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
  const a_lnk = 'https://www.amazon.de/dp/product/' + asin;
  const a_hash = createHash(a_lnk);
  update = {
    ...update,
    ...(newSellPrice && { a_prc: newSellPrice, a_uprc: newSellUPrice }),
    a_nm,
    a_lnk,
    asin,
    a_hash,
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
  return update;
};
