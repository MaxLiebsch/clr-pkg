import { Costs } from '../types/product';
import { calculateAznProvision } from './calcAznProvision';
import { roundToTwoDecimals } from './helpers';

export function calcAznCosts(
  costs: Costs,
  costsBaseSellPrice: number,
  sellPrice: number,
): number {
  if (costs.prvsn) {
    return roundToTwoDecimals((costs.prvsn / 100) * sellPrice);
  }
  if (costs.azn) {
    const provision = calculateAznProvision(costs.azn, costsBaseSellPrice);
    return roundToTwoDecimals(provision * sellPrice);
  }
  return 0;
}
