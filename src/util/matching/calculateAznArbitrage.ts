import { amazonTransportFee } from '../../constants';
import { roundToTwoDecimals } from '../helpers';

interface Costs {
  azn: number;
  varc: number;
  tpt: number;
  strg_1_hy: number;
  strg_2_hy: number;
}

const calculateMargeAndEarning = (
  sellPrice: number,
  buyPrice: number,
  costs: Costs,
  tax: number,
  period: 'strg_1_hy' | 'strg_2_hy',
  program: 'europe' | 'none' = 'europe',
) => {
  // VK - Kosten - Steuern - EK / VK * 100
  const taxCosts = Number((sellPrice - sellPrice / (1 + tax / 100)).toFixed(2));
  let totalCosts =
    costs.azn - costs.varc - costs.tpt - costs[period] - taxCosts - buyPrice;

  if (program === 'none') {
    totalCosts += amazonTransportFee;
  }

  const earning = sellPrice - totalCosts;
  const margin = ((sellPrice - totalCosts) / sellPrice) * 100;
  return {
    earning: Number(earning).toFixed(2),
    margin: Number(margin).toFixed(2),
  };
};

export const calculateAznArbitrage = (
  srcPrice: number,
  targetPrice: number,
  costs: Costs,
  tax?: number,
) => {
  const buyPrice = roundToTwoDecimals(
    srcPrice / (tax ? 1 + Number(tax / 100) : 1.19),
  );
  const sellPrice = roundToTwoDecimals(targetPrice);
  // VK(sellPrice) - Kosten - Steuern - EK(buyPrice) / VK * 100
  const { azn, tpt, varc, strg_1_hy, strg_2_hy } = costs;
  const fixedCosts = azn + varc + tpt;
  const { margin: a_mrgn_pct, earning: a_mrgn } = calculateMargeAndEarning(
    sellPrice,
    buyPrice,
    costs,
    tax ?? 15,
    'strg_1_hy',
  );
  const { margin: a_w_mrgn_pct, earning: a_w_mrgn } = calculateMargeAndEarning(
    sellPrice,
    buyPrice,
    costs,
    tax ?? 15,
    'strg_2_hy',
  );

  // Not azn europe programm
  const { margin: a_p_mrgn_pct, earning: a_p_mrgn } = calculateMargeAndEarning(
    sellPrice,
    buyPrice,
    costs,
    tax ?? 15,
    'strg_1_hy',
    'none',
  );
  const { margin: a_p_w_mrgn_pct, earning: a_p_w_mrgn } =
    calculateMargeAndEarning(
      sellPrice,
      buyPrice,
      costs,
      tax ?? 15,
      'strg_2_hy',
      'none',
    );

  return {
    a_p_mrgn,
    a_p_mrgn_pct,
    a_p_w_mrgn,
    a_p_w_mrgn_pct,
    a_mrgn,
    a_mrgn_pct,
    a_w_mrgn,
    a_w_mrgn_pct,
  };
};
