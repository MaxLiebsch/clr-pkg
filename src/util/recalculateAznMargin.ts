import { DbProductRecord } from '../types/product';
import { getAznAvgPrice } from './getAznAvgPrice';
import { retrieveAznArbitrage } from './retrieveAznArbitrage';

export const recalculateAznMargin = (
  p: DbProductRecord,
  spotterSet: Partial<DbProductRecord>,
) => {
  const {
    prc: buyPrice,
    qty: buyQty,
    a_qty: sellQty,
    a_prc: sellPrice,
    costs,
    tax,
  } = p;

  if (costs && costs.azn > 0 && sellPrice && buyPrice && sellQty && buyQty) {
    const { a_prc, avgPrice, a_useCurrPrice } = getAznAvgPrice(p, sellPrice);
    const arbitrage = retrieveAznArbitrage({
      listingPrice: a_prc,
      sellQty,
      avgPrice,
      buyPrice,
      buyQty,
      a_useCurrPrice,
      costs,
      tax,
    });

    Object.entries(arbitrage).forEach(([key, val]) => {
      (spotterSet as any)[key] = val;
    });
  }
};
