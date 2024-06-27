import { amazonTransportFee } from '../../constants';
import { roundToTwoDecimals } from '../helpers';

export const calculateAznArbitrage = (
  srcPrice: number,
  targetPrice: number,
  costs: {
    azn: number;
    varc: number;
    tpt: number;
    strg_1_hy: number;
    strg_2_hy: number;
  },
  tax?: number,
) => {
  const buyPrice = roundToTwoDecimals(
    srcPrice / (tax ? 1 + Number(tax / 100) : 1.19),
  );
  const sellPrice = roundToTwoDecimals(
    targetPrice / (tax ? 1 + Number(tax / 100) : 1.19),
  );
  // VK(sellPrice) - Kosten - Steuern - EK(buyPrice) / VK * 100
  const { azn, tpt, varc, strg_1_hy, strg_2_hy } = costs;
  const fixedCosts = azn + varc + tpt;

  const a_mrgn_costs = buyPrice + fixedCosts + strg_1_hy;
  const a_mrgn = Number((sellPrice - a_mrgn_costs).toFixed(2));
  const a_mrgn_pct = Number(((a_mrgn / sellPrice) * 100).toFixed(1));

  const a_w_mrgn_costs = buyPrice + fixedCosts + strg_2_hy;
  const a_w_mrgn = Number((sellPrice - a_w_mrgn_costs).toFixed(2));
  const a_w_mrgn_pct = Number(((a_w_mrgn / sellPrice) * 100).toFixed(1));

  // Not azn europe programm
  const a_p_mrgn_costs =
    buyPrice + fixedCosts + amazonTransportFee + strg_1_hy;
  const a_p_mrgn = Number((sellPrice - a_p_mrgn_costs).toFixed(2));
  const a_p_mrgn_pct = Number(((a_p_mrgn / sellPrice) * 100).toFixed(1));
  const a_p_w_mrgn_costs =
    buyPrice + fixedCosts + amazonTransportFee + strg_2_hy;
  const a_p_w_mrgn = Number((sellPrice - a_p_w_mrgn_costs).toFixed(2));
  const a_p_w_mrgn_pct = Number(
    ((a_p_w_mrgn / sellPrice) * 100).toFixed(1),
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
