import puppeteer from 'puppeteer1';
import puppeteer2 from 'puppeteer2';
import puppeteer3 from 'puppeteer3';

export type Versions = '122.0.6261.94' | '123.0.6312.58' | '124.0.6367.60';

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '122.0.6261.94';
  public puppeteerInstance: any = puppeteer;
  public puppeteer = {
    '122.0.6261.94': puppeteer,
    '123.0.6312.58': puppeteer2,
    '124.0.6367.60': puppeteer3,
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
