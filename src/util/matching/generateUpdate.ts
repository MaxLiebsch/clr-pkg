import { safeParsePrice } from '../safeParsePrice';
import { calculateAznArbitrage } from './calculateAznArbitrage';
import { getNumber } from './compare_helper';
import { createHash } from '../hash';
import { AddProductInfo } from '../../types/query-request';
import { DbProductRecord } from '../../types/product';
import { getAznAvgPrice } from '../getAznAvgPrice';

export const generateUpdate = (
  productInfo: AddProductInfo[],
  product: DbProductRecord,
) => {
  let { prc: buyPrice, a_qty, qty } = product;

  a_qty = a_qty || 1;

  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });
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

  const asin = infoMap.get('asin');
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

  const update: { [key: string]: any } = {
    a_lnk,
    a_hash,
    a_nm,
    asin,
    a_prc: newSellPrice,
    a_uprc: newSellUPrice,
    a_qty,
    ...(a_rating && { a_rating: Number(a_rating) }),
    ...(a_reviewcnt && { a_reviewcnt: Number(a_reviewcnt) }),
    ...(tax && { tax: Number(tax) }),
    ...(totalOfferCount && { totalOfferCount: getNumber(totalOfferCount) }),
    ...(image && { a_img: image }),
    ...(buyBoxIsAmazon && {
      buyBoxIsAmazon: buyBoxIsAmazon.toLowerCase().includes('amazon'),
    }),
    ...arbitrage,
    costs,
    a_useCurrPrice,
  };

  if (sellerRank) {
    const category = sellerRank.match(/\((.*?)\)/g);
    const number = sellerRank.match(/\d+/g);
    if (category && category.length && number && number.length) {
      update['bsr'] = [
        {
          createdAt: new Date().toISOString(),
          category: category[0].replace(/[\\(\\)]/g, '') || 'Unbekannt',
          number: safeParsePrice(number.join('') || '100000000'),
        },
      ];
    } else {
      update['bsr'] = [];
    }
  } else {
    update['bsr'] = [];
  }
  return update;
};
