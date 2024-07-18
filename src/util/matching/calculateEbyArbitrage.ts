import { ebayTier } from '../../static/ebay';
import { EbyCategory } from '../../types/ebayCategory';
import { roundToTwoDecimals } from '../helpers';

export const calculateEbyArbitrage = (
  mappedCategory: EbyCategory,
  sellPrice: number,
  bruttoBuyPrice: number, //EK  // p.prc * (p.e_qty/p.qty) Herkunftshoppreis * (QTY Zielshop/QTY Herkunftsshop)
) => {
  const nettoBuyPrice = bruttoBuyPrice / 1.19;
  const taxCosts = roundToTwoDecimals(sellPrice - sellPrice / (1 + 19 / 100));
  let totalCosts = roundToTwoDecimals(nettoBuyPrice + taxCosts);

  if (!mappedCategory) return null;

  const ebyCosts = calculateFee(sellPrice, 'no_shop', mappedCategory);
  const ebyShpCosts = calculateFee(sellPrice, 'shop', mappedCategory);

  const e_mrgn = roundToTwoDecimals(sellPrice - totalCosts - ebyShpCosts);
  const e_mrgn_pct = roundToTwoDecimals((e_mrgn / sellPrice) * 100);
  
  const e_ns_mrgn = roundToTwoDecimals(sellPrice - totalCosts - ebyCosts);
  const e_ns_mrgn_pct = roundToTwoDecimals((e_ns_mrgn / sellPrice) * 100);

  return {
    e_tax: taxCosts,
    e_costs: ebyShpCosts,
    e_mrgn,
    e_mrgn_pct,
    e_ns_costs: ebyCosts,
    e_ns_mrgn,
    e_ns_mrgn_pct,
  };
};

function calculateFee(
  sellPrice: number,
  shopType: 'no_shop' | 'shop',
  mappedCategory: EbyCategory,
) {
  const tiers = mappedCategory.tier[shopType];
  let fee = 0;

  for (let index = 0; index < tiers.length; index++) {
    const tier = tiers[index];
    if ('up_to' in tier && sellPrice <= tier.up_to!) {
      fee = sellPrice * tier.percentage;
    } else if ('above' in tier && sellPrice > tier.above!) {
      fee = sellPrice * tier.percentage;
    }
  }
  return roundToTwoDecimals(fee);
}

export function findMappedCategory(categories: number[]): EbyCategory | null {
  let mappedCategory = null as EbyCategory | null;
  categories.forEach((x: number) => {
    const result = ebayTier.find(
      (tier: EbyCategory) => tier.id === x,
    ) as EbyCategory;
    if (result) {
      mappedCategory = result;
    }
  });
  return mappedCategory;
}
