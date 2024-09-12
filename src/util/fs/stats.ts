import { join } from 'path';
const jetpack = require('fs-jetpack');
import lodash from 'lodash';
import { SiteMap } from '../../types/Sitemap';

/*
    page name
    page type category | subcategory | products
    cnt categories
    cnt product pages
    cnt products
*/

const defaults: SiteMap = {};

export class StatService {
  public static singleton: StatService;
  public pathToStatsFile: string = '';
  public stats: SiteMap = {};
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
