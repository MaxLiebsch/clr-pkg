import { roundToTwoDecimals } from './helpers';

export const calcNetPrice = (price: number, tax?: number): number => {
  return roundToTwoDecimals(price / (1 + (tax || 19) / 100));
};
