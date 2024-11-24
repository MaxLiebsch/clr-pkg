import { proxies } from '../../constants';
import { BrowserGroup, BrowserInfo } from '../../types';
import { browserLoadChecker } from '../helpers';
import { VersionProvider, Versions } from '../versionProvider';
import puppeteer from 'rebrowser-puppeteer';
import os from 'os';

let _browsers: BrowserGroup = {};

export const startBrowsers = async (range: number[]) => {
  _browsers = await mainBrowsers(range);
};

export const browsersInitialized = async (range: number[]) => {
  if (Object.keys(_browsers).length > 0) {
  } else {
    await startBrowsers(range);
  }
};

export const getFreeBrowser = async (
  browsers?: BrowserGroup,
): Promise<BrowserInfo> => {
  if (browsers) {
    const browser = browserLoadChecker(browsers);
    browsers[browser.id].load = browsers[browser.id].load + 1;
    return browser;
  } else {
    const browser = browserLoadChecker(_browsers);
    _browsers[browser.id].load = _browsers[browser.id].load + 1;
    return browser;
  }
};

export const freeUpBrowser = async (
  browserId: string,
  browsers?: BrowserGroup,
) => {
  if (browsers) {
    browsers[browserId].load !== 0
      ? (browsers[browserId].load = browsers[browserId].load - 1)
      : null;
  } else {
    _browsers[browserId].load !== 0
      ? (_browsers[browserId].load = _browsers[browserId].load - 1)
      : null;
  }
};

async function hasOpenPages(browser: any) {
  if ((await browser.pages()).length === 1) {
    return 'done';
  } else {
    return 'working';
  }
}

export const browserHealthCheck = async (browsers?: BrowserGroup) => {
  if (browsers) {
    return Object.keys(browsers).reduce(
      async (
        accP: Promise<{ id: string; status: 'done' | 'working' }[]>,
        key,
      ) => {
        const acc: any = await accP;
        acc.push({
          id: browsers[key].id,
          status: await hasOpenPages(browsers[key].brs),
        });
        return acc;
      },
      Promise.resolve([]),
    );
  } else {
    return Object.keys(_browsers).reduce(
      async (
        accP: Promise<{ id: string; status: 'done' | 'working' }[]>,
        key,
      ) => {
        const acc: any = await accP;
        acc.push({
          id: _browsers[key].id,
          status: await hasOpenPages(_browsers[key].brs),
        });
        return acc;
      },
      Promise.resolve([]),
    );
  }
};

let args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--lang=de',
  '--disable-gpu',
  '--disable-webrtc',
  '--disable-blink-features=AutomationControlled',
  '--webrtc-ip-handling-policy=disable_non_proxied_udp',
  '--force-webrtc-ip-handling-policy',
  '--start-maximized',
];

export const mainBrowsers = async (
  range: number[],
  passwordAuth: boolean = false,
  proxyPerPage: boolean = false,
) =>
  new Promise<BrowserGroup>((resolve, reject) => {
    const browsers = proxies
      .slice(range[0], range[1])
      .reduce(async (acc: any, proxy, index) => {
        const _proxy = passwordAuth ? process.env.PROXY_URL : proxy;
        const proxySetting = '--proxy-server=' + _proxy;

        if (!proxyPerPage) args.push(proxySetting);
        const res = await acc;

        const b = await puppeteer.launch({
          headless: process.env.NODE_ENV === 'production' ? true : false,
          args,
          defaultViewport: null,
          ignoreDefaultArgs: ['--enable-automation'],
        });
        console.log(await b.version());
        res[index] = {
          brs: b,
          load: 0,
          id: index,
          openPages: 0,
          status: 'active',
        };
        return await acc;
      }, {});

    resolve(browsers);
  });

export const mainBrowser = async (
  proxyAuth: { host: string },
  version: Versions,
  csp: boolean = true,
) => {
  if (proxyAuth) {
    const proxySetting = '--proxy-server=' + proxyAuth.host;
    args.push(proxySetting);
  }

  if (csp !== undefined && csp === false) {
    args.push('--disable-web-security');
  }

  const provider = VersionProvider.getSingleton();
  provider.switchVersion(version);

  const options: any = {
    headless: process.env.HEADLESS === 'true' ? true : false,
    devtools: process.env.DEV_TOOLS === 'true' ? true : false,
    args,
    defaultViewport: null,
    timeout: 600000,
    protocolTimeout: 60000,
    ignoreDefaultArgs: ['--enable-automation'],
  };
  
  if (os.platform() === 'win32') {
    options['executablePath'] =
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  } else if (os.platform() === 'linux') {
    options['executablePath'] = '/usr/bin/google-chrome';
  }

  const browser = await puppeteer.launch(options);

  console.log('Browser Version: ', await browser.version());
  return browser;
};
