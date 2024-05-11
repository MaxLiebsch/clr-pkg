import { proxies } from '../constants';
import { BrowserGroup, BrowserInfo } from '../types';
import { browserLoadChecker } from './helpers';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import { LoggerService } from './logger';
import { QueueTask } from '../types/QueueTask';
import { hostname } from 'os';

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

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

async function hasOpenPages(browser: Browser) {
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
        const args = [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--start-maximized',
        ];
        if (!proxyPerPage) args.push(proxySetting);
        const res = await acc;
        try {
          puppeteer.use(StealthPlugin());
        } catch (error) {
          if (error instanceof Error)
            LoggerService.getSingleton().logger.info({
              location: `'StealthPluginCatch`,
              msg: error.message,
              stack: error?.stack,
              hostname: hostname(),
            });
          else
            LoggerService.getSingleton().logger.info({
              location: `'StealthPluginCatch`,
              msg: error,
              hostname: hostname(),
            });
        }
        const b = await puppeteer.launch({
          headless: process.env.NODE_ENV === 'production' ? true : false,
          args,
          defaultViewport: null,
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
  task: QueueTask,
  proxyAuth?: { host: string },
) => {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--lang=de_DE,de',
    '--disable-gpu',
    '--disable-web-security',
    '--start-maximized',
    'javascript:close()',
  ];

  if (proxyAuth) {
    const proxySetting = '--proxy-server=' + proxyAuth.host;
    args.push(proxySetting);
  }
  try {
    puppeteer.use(StealthPlugin());
    // puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
  } catch (error) {
    if (error instanceof Error)
      LoggerService.getSingleton().logger.info({
        location: `'StealthPluginCatch`,
        msg: error.message,
        stack: error?.stack,
        hostname: hostname(),
        type: task.type,
        typeId: task.id,
        shopDomain: task.shopDomain,
      });
    else
      LoggerService.getSingleton().logger.info({
        location: `'StealthPluginCatch`,
        msg: error,
        hostname: hostname(),
        type: task.type,
        typeId: task.id,
        shopDomain: task.shopDomain,
      });
  }

  const options = {
    headless: process.env.NODE_ENV === 'production' ? true : false,
    devtools: process.env.NODE_ENV !== 'production',
    args,
    defaultViewport: null,
    timeout: 600000,
    protocolTimeout: 60000,
  };
  if (process.env.NODE_ENV === 'production') {
    //@ts-ignore
    options['executablePath'] = '/usr/bin/google-chrome';
  }

  const browser = await puppeteer.launch(options);

  console.log('Browser Version: ', await browser.version());
  return browser;
};
