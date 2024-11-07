export const calculateAznProvision = (aznCosts: number, sellPrice: number) => {
  return Math.ceil((aznCosts / sellPrice) * 100);
};
