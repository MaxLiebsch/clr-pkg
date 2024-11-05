
import puppeteer from 'rebrowser-puppeteer';

export const puppeteerVersions = {
  '130.0.6723.91': puppeteer, // Puppeteer v23.7.0
  '129.0.6668.100': puppeteer, // Puppeteer v23.5.3
  '129.0.6668.91': puppeteer, // Puppeteer v23.5.1
  '129.0.6668.89': puppeteer, // Puppeteer v23.5.0
  '129.0.6668.70': puppeteer, // Puppeteer v23.4.1
  '129.0.6668.58': puppeteer, // Puppeteer v23.4.0
  '128.0.6613.137	': puppeteer, // Puppeteer v23.3.1
  '128.0.6613.119	': puppeteer, // Puppeteer v23.3.0
};

export type Versions = keyof typeof puppeteerVersions;

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '130.0.6723.91';
  public puppeteerInstance: any = puppeteer;
  public puppeteer = puppeteerVersions;

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
