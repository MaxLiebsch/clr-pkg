import { Costs } from '../types/product';
import { calcAznCosts } from './calcAznCosts';
import { calculatePriceRatio } from './calcPriceRatio';
import { calculateAznArbitrage } from './matching/calculateAznArbitrage';

interface CalcAznArbitrage {
  listingPrice: number;
  sellQty: number;
  buyQty: number;
  tax?: number;
  buyPrice: number;
  avgPrice: number;
  a_useCurrPrice: boolean | undefined;
  costs: Costs;
}

export const retrieveAznArbitrage = ({
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

  costs.azn = calcAznCosts(costs, listingPrice, sellPrice);

  const arbitrage = calculateAznArbitrage(
    calculatePriceRatio(buyPrice, sellQty, buyQty),
    sellPrice,
    costs,
    tax,
  );

  return arbitrage;
};
