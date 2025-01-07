import { AVG_PRICES, AvgPrices, DbProductRecord } from '../types/DbProductRecord';
import { roundToTwoDecimals } from './helpers';

export const determineAdjustedSellPrice = (
  product: DbProductRecord,
  newSellPrice: number,
) => {
  let a_useCurrPrice = true;

  let { a_uprc, a_qty } = product;

  const { avgPrice, avgField } = getAznAvgPrice(product);

  if (avgPrice) {
    a_useCurrPrice = false;
  }

  if (avgPrice > 0) {
    newSellPrice = avgPrice;
    a_uprc = roundToTwoDecimals(avgPrice / (a_qty || 1));
  } else if (newSellPrice > 0) {
    a_uprc = roundToTwoDecimals(newSellPrice / (a_qty || 1));
  }

  return { a_useCurrPrice, a_prc: newSellPrice, a_uprc, avgPrice, avgField };
};

export const getAznAvgPrice = (product: DbProductRecord) => {
  let avgPrice = 0;
  let avgField: AvgPrices | null = null;
  const {
    avg30_buyBoxPrice,
    avg30_ansprcs,
    avg30_ahsprcs,
    avg90_buyBoxPrice,
    avg90_ansprcs,
    avg90_ahsprcs,
  } = product;

  if (avg30_buyBoxPrice && avg30_buyBoxPrice > 0) {
    avgPrice = avg30_buyBoxPrice;
    avgField = AVG_PRICES.avg30_buyBoxPrice;
  } else if (avg30_ansprcs && avg30_ansprcs > 0) {
    avgPrice = avg30_ansprcs;
    avgField = AVG_PRICES.avg30_ansprcs;
  } else if (avg30_ahsprcs && avg30_ahsprcs > 0) {
    avgPrice = avg30_ahsprcs;
    avgField = AVG_PRICES.avg30_ahsprcs;
  } else if (avg90_buyBoxPrice && avg90_buyBoxPrice > 0) {
    avgPrice = avg90_buyBoxPrice;
    avgField = AVG_PRICES.avg90_buyBoxPrice;
  } else if (avg90_ansprcs && avg90_ansprcs > 0) {
    avgPrice = avg90_ansprcs;
    avgField = AVG_PRICES.avg90_ansprcs;
  } else if (avg90_ahsprcs && avg90_ahsprcs > 0) {
    avgPrice = avg90_ahsprcs;
    avgField = AVG_PRICES.avg90_ahsprcs;
  }

  avgPrice = roundToTwoDecimals(avgPrice / 100);

  return { avgPrice, avgField };
};
