import { getCoefficients } from '../static/aznMonthlySalesCoefficients';
import { Categories, CategroyTree } from '../types/aznSalesRankCoefficients';
import { AznCategoryMapper } from './AznCategoryMapper';

const aznCategoryMapper = AznCategoryMapper.getInstance(
  '../static/aznCategoryMapping.json',
);
export function calculateMonthlySales(
  categoryIds: number[],
  salesRanks: { [key: number]: number[][] },
  categoryTree: CategroyTree[],
) {
  const salesRankAndCoefficients = findSalesRankAndCoefficients(
    categoryIds,
    salesRanks,
    categoryTree,
  );
  if (!salesRankAndCoefficients) return null;
  const { salesRank, coefficients } = salesRankAndCoefficients;
  const { a, b } = coefficients;
  return Math.min(5000, Math.floor(a * Math.exp(b * salesRank)));
}

const findSalesRankAndCoefficients = (
  categoryIds: number[],
  salesRanks: { [key: number]: number[][] },
  categoryTree: CategroyTree[],
) => {
  const category = categoryTree.find((c) =>
    getCoefficients(c.name as Categories),
  );

  if (category) {
    const salesRankArr = salesRanks[category.catId];
    if (salesRankArr) {
      const salesRank = salesRankArr[salesRankArr.length - 1];

      if (salesRank[1] !== -1) {
        return {
          salesRank: salesRank[1],
          coefficients: getCoefficients(category.name as Categories),
        };
      }
    }
  }

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
      const coefficients = getCoefficients(category as Categories);
      if (coefficients) {
        const salesRankArr = salesRanks[exisitingCategoryIds[i]];
        if (salesRankArr) {
          const salesRank = salesRankArr[salesRankArr.length - 1];

          if (salesRank[1] !== -1) {
            return {
              salesRank: salesRank[1],
              coefficients,
            };
          }
        }
      }

      const categoryTreeItem = categoryTree.find(
        (treeItem) => treeItem.name === category,
      );
      if (categoryTreeItem) {
        const salesRankArr = salesRanks[categoryTreeItem.catId];
        if (salesRankArr) {
          const salesRank = salesRankArr[salesRankArr.length - 1];

          if (salesRank[1] === -1) continue;
          return {
            salesRank: salesRank[1],
            coefficients: getCoefficients(category as Categories),
          };
        }
      }
    }
  }
  return null;
};
