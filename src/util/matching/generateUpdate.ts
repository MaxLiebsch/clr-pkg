import { UTCDate } from '@date-fns/utc';
import { ProductInfo } from '../../types/query-request';
import { roundToTwoDecimals } from '../helpers';
import { safeParsePrice } from '../safeParsePrice';
import { calculateAznArbitrage } from './calculateAznArbitrage';
import { getNumber } from './compare_helper';
import { createHash } from '../hash';

export const generateUpdate = (
  productInfo: ProductInfo[],
  buyPrice: number,
  a_qty: number,
  qty: number,
) => {
  const infoMap = new Map();
  productInfo.forEach((info) => {
    infoMap.set(info.key, info.value);
  });
  let a_prc = safeParsePrice(infoMap.get('a_prc') || '0');

  if (a_prc === 0) throw new Error('a_prc is 0');

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

  const tax = infoMap.get('tax');
  const totalOfferCount = infoMap.get('totalOfferCount');
  let a_uprc = roundToTwoDecimals(a_prc / a_qty);

  const sellerRank = infoMap.get('sellerRank');
  const image = infoMap.get('a_img');
  const buyBoxIsAmazon = infoMap.get('buyBoxIsAmazon');
  // prc * (a_qty / qty) //EK  //QTY Zielshop/QTY Herkunftsshop
  // a_prc VK
  const arbitrage = calculateAznArbitrage(
    buyPrice * (a_qty / qty),
    a_prc,
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
    a_prc,
    a_uprc,
    a_qty,
    ...(tax && { tax: Number(tax) }),
    ...(totalOfferCount && { totalOfferCount: getNumber(totalOfferCount) }),
    ...(image && { a_img: image }),
    ...(buyBoxIsAmazon && {
      buyBoxIsAmazon: buyBoxIsAmazon.toLowerCase().includes('amazon'),
    }),
    ...arbitrage,
    costs,
  };

  if (sellerRank) {
    const category = sellerRank.match(/\((.*?)\)/g);
    const number = sellerRank.match(/\d+/g);
    if (category && number) {
      update['bsr'] = [
        {
          createdAt: new UTCDate().toISOString(),
          category: category[0].replace(/[\\(\\)]/g, ''),
          number: safeParsePrice(number.join('')),
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
