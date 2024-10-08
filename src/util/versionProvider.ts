import puppeteer8 from 'puppeteer8'; // Puppeteer v23.5.0
import puppeteer7 from 'puppeteer7'; // Puppeteer v23.4.1
import puppeteer6 from 'puppeteer6'; // Puppeteer v23.4.0
import puppeteer5 from 'puppeteer5'; // Puppeteer v23.3.1
import puppeteer4 from 'puppeteer4'; // Puppeteer v23.3.0
import puppeteer3 from 'puppeteer3'; // Puppeteer v23.2.1
import puppeteer2 from 'puppeteer2'; // Puppeteer v23.2.0
import puppeteer from 'puppeteer1'; // Puppeteer v23.1.1

export const puppeteerVersions = {
  '129.0.6668.89': puppeteer8,// Puppeteer v23.5.0
  '129.0.6668.70': puppeteer7,// Puppeteer v23.4.1
  '129.0.6668.58': puppeteer6,// Puppeteer v23.4.0
  '128.0.6613.137	': puppeteer5,// Puppeteer v23.3.1
  '128.0.6613.119	': puppeteer4,// Puppeteer v23.3.0
  '128.0.6613.86': puppeteer3,// Puppeteer v23.2.1
  '128.0.6613.84': puppeteer2,// Puppeteer v23.2.0
  '127.0.6533.119': puppeteer,// Puppeteer v23.1.1
};

export type Versions = keyof typeof puppeteerVersions;

export class VersionProvider {
  public currentPuppeteerVersion: Versions = '129.0.6668.89';
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
