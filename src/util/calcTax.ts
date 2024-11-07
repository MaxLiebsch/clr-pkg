import { calcNetPrice } from './calcNetPrice';
import { roundToTwoDecimals } from './helpers';

export const calcTax = (price: number, tax?: number): number => {
  return roundToTwoDecimals(price - calcNetPrice(price, tax));
};
