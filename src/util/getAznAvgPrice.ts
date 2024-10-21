import { DbProductRecord } from '../types/product';
import { roundToTwoDecimals } from './helpers';

export const getAznAvgPrice = (
  product: DbProductRecord,
  newSellPrice: number,
) => {
  let avgPrice = 0;
  let a_useCurrPrice = true;

  let {
    avg30_ansprcs,
    avg30_ahsprcs,
    avg90_ahsprcs,
    avg90_ansprcs,
    a_uprc,
    a_qty,
  } = product;

  if (avg30_ahsprcs && avg30_ahsprcs > 0) {
    avgPrice = avg30_ahsprcs;
  } else if (avg30_ansprcs && avg30_ansprcs > 0) {
    avgPrice = avg30_ansprcs;
  } else if (avg90_ahsprcs && avg90_ahsprcs > 0) {
    avgPrice = avg90_ahsprcs;
  } else if (avg90_ansprcs && avg90_ansprcs > 0) {
    avgPrice = avg90_ansprcs;
  }

  avgPrice = roundToTwoDecimals(avgPrice / 100);

  if (newSellPrice < avgPrice) {
    a_useCurrPrice = false;
  }

  if (newSellPrice === 0 && avgPrice > 0) {
    newSellPrice = avgPrice;
    a_uprc = roundToTwoDecimals(avgPrice / a_qty!);
  } else if (newSellPrice > 0) {
    a_uprc = roundToTwoDecimals(newSellPrice / a_qty!);
  }

  return { a_useCurrPrice, a_prc: newSellPrice, a_uprc, avgPrice };
};
