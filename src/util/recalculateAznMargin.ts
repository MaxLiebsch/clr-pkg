import { DbProductRecord } from '../types/DbProductRecord';
import { determineAdjustedSellPrice } from './getAznAvgPrice';
import { retrieveAznArbitrageAndCosts } from './retrieveAznArbitrage';

export const recalculateAznMargin = (
  product: DbProductRecord,
  oldListingPrice: number,
  spotterSet: Partial<DbProductRecord>,
) => {
  const {
    prc: buyPrice,
    qty: buyQty,
    a_qty: sellQty,
    a_prc: newSellPrice,
    costs,
    tax,
  } = product;

  if (costs && costs.azn > 0 && newSellPrice && buyPrice && sellQty && buyQty) {
    const { a_prc, avgPrice,avgField, a_useCurrPrice } = determineAdjustedSellPrice(
      product,
      newSellPrice,
    );

    const arbitrageAndCosts = retrieveAznArbitrageAndCosts({
      oldListingPrice,
      listingPrice: a_prc,
      sellQty,
      avgPrice,
      buyPrice,
      buyQty,
      a_useCurrPrice,
      costs,
      tax,
    });

    Object.entries(arbitrageAndCosts).forEach(([key, val]) => {
      (spotterSet as any)[key] = val;
    });

    spotterSet['a_avg_fld'] = avgField
    spotterSet['a_avg_price'] = avgPrice;

    if (!product.a_pblsh) {
      spotterSet['a_pblsh'] = true;
    }

    spotterSet['a_useCurrPrice'] = a_useCurrPrice;
  }
};
