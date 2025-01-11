import { AznProduct, DbProduct, EbyProduct } from '../types/DbProductRecord';

export class CProduct {
  private core: DbProduct;
  private eby: EbyProduct;
  private azn: AznProduct;
  constructor(core: DbProduct, eby: EbyProduct, azn: AznProduct) {
    this.core = core;
    this.eby = eby;
    this.azn = azn;
  }

  getCore() {
    return this.core;
  }

  getEby() {
    return this.eby;
  }

  getAzn() {
    return this.azn;
  }
}
