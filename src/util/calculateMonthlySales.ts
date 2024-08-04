import { getCoefficients } from '../static/aznMonthlySalesCoefficients';
import { Categories } from '../types/aznSalesRankCoefficients';
import { AznCategoryMapper } from './AznCategoryMapper';

const aznCategoryMapper = AznCategoryMapper.getInstance(
  '../static/aznCategoryMapping.json',
);
export function calculateMonthlySales(
  categoryIds: number[],
  salesRanks: { [key: number]: number[] },
) {
  const salesRankAndCoefficients = findSalesRankAndCoefficients(
    categoryIds,
    salesRanks,
  );
  if(!salesRankAndCoefficients) return null;
  const { salesRank, coefficients } = salesRankAndCoefficients;
  const { a, b } = coefficients;
  return Math.floor(a * Math.exp(b * salesRank));
}


const findSalesRankAndCoefficients = (
  categoryIds: number[],
  salesRanks: { [key: number]: number[] },
) => {
  const salesRanksKeys = Object.keys(salesRanks);
  const exisitingCategoryIds = categoryIds.filter((id) => {
    if (salesRanksKeys.includes(id.toString())) {
      return true;
    } else {
      delete salesRanks[id];
      return false;
    }
  });

  for (let i = 0; i < exisitingCategoryIds.length; i++) {
    const category = aznCategoryMapper.get(exisitingCategoryIds[i]);
    if (category) {
      const salesRankArr = salesRanks[exisitingCategoryIds[i]];
      const salesRank = salesRankArr[salesRankArr.length - 1];

      if (salesRank === -1) continue;
      return {
        salesRank,
        coefficients: getCoefficients(category as Categories),
      };
    }
  }
  return null;
};
