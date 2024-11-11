import { Costs } from '../types/DbProductRecord';
import { calcAznProvision } from './calcAznProvision';
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
    const provision = calcAznProvision(costs.azn, costsBaseSellPrice);
    return roundToTwoDecimals((provision / 100) * sellPrice);
  }
  return 0;
}
