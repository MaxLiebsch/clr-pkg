import { roundToTwoDecimals } from '../helpers';

export const calculateOnlyArbitrage = (
  srcPrice: number,
  targetPrice: number,
) => {
  const nettoSrcPrice = srcPrice / 1.19;
  const nettoTargetPrice = targetPrice / 1.19;
  const mrgn = roundToTwoDecimals(nettoTargetPrice - nettoSrcPrice);
  const mrgn_pct = roundToTwoDecimals((mrgn / nettoTargetPrice) * 100);
  return {
    mrgn,
    mrgn_pct,
  };
};
