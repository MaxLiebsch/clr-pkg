import { Costs } from '../types/DbProductRecord';
import {
  AznPlatform,
  EbyPlatform,
  ProductCore,
  SourceInfo,
} from '../types/What';
import { roundToTwoDecimals } from './helpers';

export class CProduct {
  private core: ProductCore;
  private sourceInfo: SourceInfo;
  private eby: EbyPlatform;
  private azn: AznPlatform;

  constructor(
    core: ProductCore,
    sourceInfo: SourceInfo,
    eby: EbyPlatform,
    azn: AznPlatform,
  ) {
    this.core = core;
    this.sourceInfo = sourceInfo;
    this.eby = eby;
    this.azn = azn;
  }

  public getCore(): ProductCore {
    return this.core;
  }

  public aznInitialized(): boolean {
    return this.core.status.azn === 'complete';
  }

  public ebyInitialized(): boolean {
    return this.core.status.eby === 'complete';
  }

  // AznPlatform

  public updateCosts(update: Costs): void {
    this.azn.costs = {
      ...this.azn.costs,
      ...update,
    };
  }

  public updatePrice(price: number): void {
    this.azn.price = price;
  }
  public updateUnitPrice(unitPrice: number): void {
    this.azn.unitPirce = unitPrice;
  }

  public setArbitrageBasePrice(newSellPrice: number): number {
    let avgPrice = 0;
    let a_useCurrPrice = true;

    const { avg30_ansprcs, avg30_ahsprcs, avg90_ahsprcs, avg90_ansprcs } =
      this.azn.keepaProperties;

    const { quantity } = this.azn;

    if (avg30_ahsprcs && avg30_ahsprcs > 0) {
      avgPrice = avg30_ahsprcs;
    } else if (avg30_ansprcs && avg30_ansprcs > 0) {
      avgPrice = avg30_ansprcs;
    } else if (avg90_ahsprcs && avg90_ahsprcs > 0) {
      avgPrice = avg90_ahsprcs;
    } else if (avg90_ansprcs && avg90_ansprcs > 0) {
      avgPrice = avg90_ansprcs;
    }

    avgPrice = roundToTwoDecimals(avgPrice / 100);

    if (newSellPrice < avgPrice) {
      a_useCurrPrice = false;
    }

    if (newSellPrice <= 1 && avgPrice > 0) {
      this.azn.price = avgPrice;
      this.azn.unitPirce = roundToTwoDecimals(avgPrice / (quantity || 1));
    } else if (newSellPrice > 0) {
      this.azn.unitPirce = roundToTwoDecimals(newSellPrice / (quantity || 1));
    }

    this.azn.useListingPrice = a_useCurrPrice;

    return avgPrice;
  }

  public recalculateAznArbitrage(newSellPrice: number): void {
    this.setArbitrageBasePrice(newSellPrice);
    // calculate arbitrage
  }
}
