import { ebayTier } from '../../static/ebay';
import { EbyCategory } from '../../types/ebayCategory';
import { roundToTwoDecimals } from '../helpers';

export const calculateEbyArbitrage = (
  categories: number[],
  sellPrice: number,
  bruttoBuyPrice: number,
) => {
  const buyPrice = bruttoBuyPrice / 1.19;
  const taxCosts = Number((sellPrice - sellPrice / (1 + 19 / 100)).toFixed(2));
  let totalCosts = Number((buyPrice + taxCosts).toFixed(2));

  let mappedCategory = null as EbyCategory | null;

  categories.forEach((x: number) => {
    const result = ebayTier.find(
      (tier: EbyCategory) => tier.id === x,
    ) as EbyCategory;
    if (result) {
      mappedCategory = result;
    }
  });

  if (!mappedCategory) return null;

  const ebyCosts = calculateFee(sellPrice, 'no_shop', mappedCategory);
  const ebyShpCosts = calculateFee(sellPrice, 'shop', mappedCategory);
  const e_mrgn = roundToTwoDecimals(sellPrice - totalCosts - ebyShpCosts);
  const e_mrgn_pct = roundToTwoDecimals(
    ((sellPrice - totalCosts - ebyShpCosts) / sellPrice) * 100,
  );
  const e_ns_mrgn = roundToTwoDecimals(sellPrice - totalCosts - ebyCosts);
  const e_ns_mrgn_pct = roundToTwoDecimals(
    ((sellPrice - totalCosts - ebyCosts) / sellPrice) * 100,
  );

  return { e_mrgn, e_mrgn_pct, e_ns_mrgn, e_ns_mrgn_pct };
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
