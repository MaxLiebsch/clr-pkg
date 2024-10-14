import puppeteer8 from 'puppeteer8'; 
import puppeteer7 from 'puppeteer7';
import puppeteer6 from 'puppeteer6';
import puppeteer5 from 'puppeteer5';
import puppeteer4 from 'puppeteer4';
import puppeteer3 from 'puppeteer3';
import puppeteer2 from 'puppeteer2';
import puppeteer from 'puppeteer1';

export const puppeteerVersions = {
  '129.0.6668.100': puppeteer8, // Puppeteer v23.5.3
  '129.0.6668.91': puppeteer7, // Puppeteer v23.5.1
  '129.0.6668.89': puppeteer6, // Puppeteer v23.5.0
  '129.0.6668.70': puppeteer5, // Puppeteer v23.4.1
  '129.0.6668.58': puppeteer4, // Puppeteer v23.4.0
  '128.0.6613.137	': puppeteer3, // Puppeteer v23.3.1
  '128.0.6613.119	': puppeteer2, // Puppeteer v23.3.0
  '128.0.6613.86': puppeteer, // Puppeteer v23.2.1
};

export type Versions = keyof typeof puppeteerVersions;

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '129.0.6668.100';
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
