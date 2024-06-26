import puppeteer from 'puppeteer1'; // Puppeteer v22.7.0
import puppeteer2 from 'puppeteer2'; // Puppeteer v22.8.0
import puppeteer3 from 'puppeteer3'; // Puppeteer v22.9.0
import puppeteer4 from 'puppeteer4'; // Puppeteer v22.8.2
import puppeteer5 from 'puppeteer5'; // Puppeteer v22.10.0
import puppeteer6 from 'puppeteer6'; // Puppeteer v22.11.0
import puppeteer7 from 'puppeteer7'; // Puppeteer v22.11.1
import puppeteer8 from 'puppeteer8'; // Puppeteer v22.12.0

export const puppeteerVersions = {
  '124.0.6367.60': puppeteer, // Puppeteer v22.7.0
  '124.0.6367.91': puppeteer2, // Puppeteer v22.8.0
  '124.0.6367.207': puppeteer3, // Puppeteer v22.8.2
  '125.0.6422.60': puppeteer4, // Puppeteer v22.9.0
  '125.0.6422.78': puppeteer5, // Puppeteer v22.10.0
  '126.0.6478.55': puppeteer6, // Puppeteer v22.11.0
  '126.0.6478.61': puppeteer7, // Puppeteer v22.11.1
  '126.0.6478.63': puppeteer8, // Puppeteer v22.12.0
};

export type Versions = keyof typeof puppeteerVersions;

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '126.0.6478.63';
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
