export const calculateOnlyArbitrage = (
  srcPrice: number,
  targetPrice: number,
) => {
  const nettoSrcPrice = srcPrice / 1.19;
  const nettoTargetPrice = targetPrice / 1.19;
  const mrgn = Number((nettoTargetPrice - nettoSrcPrice).toFixed(2));
  const mrgn_pct = Number(((mrgn / nettoTargetPrice) * 100).toFixed(1));
  return {
    mrgn,
    mrgn_pct,
  };
};
