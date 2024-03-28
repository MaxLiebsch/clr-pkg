import { join } from 'path';
const jetpack = require('fs-jetpack');
import lodash from 'lodash';

/*
    page name
    page type category | subcategory | products
    cnt categories
    cnt product pages
    cnt products
*/

export interface ProductPage {
  offset?: number;
  missing?: string;
  link: string;
  cnt?: number;
}

export interface SubCategory {
  link: string;
  cnt_category?: number;
  cnt_pages?: number;
  cnt_products?: number;
  productpages?: ProductPage[];
  subcategories?: {
    [key: string]: SubCategory;
  };
}

export interface SubCategories {
  [key: string]: SubCategory;
}

export interface ICategoryStats {
  default: {};
  link: string;
  name: string;
  cnt_category: number;
  subcategories: SubCategories;
}

const defaults: { [key: string]: ICategoryStats } = {};

export class StatService {
  public static singleton: StatService;
  public pathToStatsFile: string = '';
  public stats: { [key: string]: ICategoryStats } = {}
  public static getSingleton(shopDomain: string): StatService {
    if (!StatService.singleton) {
      StatService.singleton = new StatService(shopDomain);
    }
    return StatService.singleton;
  }
  constructor(shopDomain: string) {
    this.pathToStatsFile = join(
      process.cwd(),
      `./data/shop/${shopDomain}/stats.json`,
    );
  }
  getStatsFile = () => {
    return this.stats;
    let statsFilePath = jetpack.path(this.pathToStatsFile);
    let settingsFileContents = jetpack.read(statsFilePath, 'utf8');
    if (!settingsFileContents) return {};
    return JSON.parse(settingsFileContents);
  };

  setStatsFile = (settingsFileObject: any) => {
    this.stats = settingsFileObject;
    // let statsFilePath = jetpack.path(this.pathToStatsFile);
    // let settingsFileString = JSON.stringify(settingsFileObject, null, 2);
    // jetpack.write(statsFilePath, settingsFileString, { atomic: true });
  };
  set = (
    keyPath: string,
    value: string | boolean | number | object | Array<object>,
  ) => {
    const parsedStats = this.getStatsFile();
    lodash.set(parsedStats, keyPath, value);
    this.setStatsFile(parsedStats);
    return true;
  };

  get = (keyPath: string) => {
    const parsedStats = this.getStatsFile();
    let value = lodash.get(parsedStats, keyPath);
    return value !== undefined
      ? value
      : lodash.get(defaults, `${keyPath}.default`);
  };
}
