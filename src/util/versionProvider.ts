import puppeteer from 'puppeteer1';
import puppeteer2 from 'puppeteer2';
import puppeteer3 from 'puppeteer3';
import puppeteer4 from 'puppeteer4';
import puppeteer5 from 'puppeteer5';

export type Versions = '122.0.6261.94' | '123.0.6312.58' | '124.0.6367.60' | '124.0.6367.91' | '125.0.6422.60';

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '124.0.6367.60';
  public puppeteerInstance: any = puppeteer;
  public puppeteer = {
    '122.0.6261.94': puppeteer,
    '123.0.6312.58': puppeteer2,
    '124.0.6367.60': puppeteer3,
    '124.0.6367.91': puppeteer4,
    '125.0.6422.60': puppeteer5,
  };

  public static singleton: VersionProvider;
  public static getSingleton(): VersionProvider {
    if (!VersionProvider.singleton) {
      VersionProvider.singleton = new VersionProvider();
    }
    return VersionProvider.singleton;
  }
  constructor(version?: Versions) {
    if (version) {
      this.switchVersion(version);
    }
  }

  switchVersion(version: Versions) {
    this.currentPuppeteerVersion = version;
    this.puppeteerInstance = this.puppeteer[version];
  }
  get currentVersion() {
    return this.currentPuppeteerVersion;
  }

  get currentPuppeteer() {
    return this.puppeteerInstance;
  }
}
