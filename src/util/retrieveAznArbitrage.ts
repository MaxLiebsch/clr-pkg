import { Costs } from '../types/DbProductRecord';
import { calcAznCosts } from './calcAznCosts';
import { calculatePriceRatio } from './calcPriceRatio';
import { calculateAznArbitrage } from './matching/calculateAznArbitrage';

interface CalcAznArbitrage {
  oldListingPrice: number;
  listingPrice: number;
  sellQty: number;
  buyQty: number;
  tax?: number;
  buyPrice: number;
  avgPrice: number;
  a_useCurrPrice: boolean | undefined;
  costs: Costs;
}

export const retrieveAznArbitrageAndCosts = ({
  oldListingPrice,
  listingPrice,
  sellQty,
  buyPrice,
  avgPrice,
  tax,
  buyQty,
  a_useCurrPrice,
  costs,
}: CalcAznArbitrage) => {
  
  const sellPrice = a_useCurrPrice ? listingPrice : avgPrice;

  costs.azn = calcAznCosts(costs, oldListingPrice, sellPrice);

  const arbitrage = calculateAznArbitrage(
    calculatePriceRatio(buyPrice, sellQty, buyQty),
    sellPrice,
    costs,
    tax,
  );

  return { ...arbitrage, costs };
};
