import { roundToTwoDecimals } from './helpers';

export const calculatePriceRatio = (
  buyPrice: number,
  sellQty: number,
  buyQty: number,
) => {
  return roundToTwoDecimals(buyPrice * (sellQty / buyQty));
};
