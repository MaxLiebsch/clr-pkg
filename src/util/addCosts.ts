import { roundToTwoDecimals } from "./helpers";

export const addCosts = (costs: number[]) => {
  return roundToTwoDecimals(costs.reduce((acc, cost) => acc + cost, 0)) ;
};
