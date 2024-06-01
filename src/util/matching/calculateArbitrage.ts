export const calculateOnlyArbitrage = (srcPrice: number, targetPrice: number) => {
  const mrgn = Number((targetPrice - srcPrice).toFixed(2));
  const mrgn_pct = Number(((mrgn / srcPrice) * 100).toFixed(1));
  return {
    prc: targetPrice,
    mrgn,
    fat: mrgn > 0 ? true : false,
    mrgn_pct,
  };
};
