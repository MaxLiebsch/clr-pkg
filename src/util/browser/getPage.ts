import { Browser, Page, ResourceType } from 'rebrowser-puppeteer';
import {
  graphicsCardListByPlatform,
  proxyTypeTimezones,
  screenResolutionsByPlatform,
  timezones,
  userAgentList,
} from '../../constants';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../../types/rules';
import { Shop } from '../../types/shop';
import { ProxyType } from '../../types/proxyAuth';
import { VersionProvider } from '../versionProvider';
import { globalEventEmitter } from '../events';

//Amazon has 9,5 pages per session, Instagram 11,6
//Absprungrate 35,1% Amazon, 35,8% Instagram (Seite wird wieder verlassen ohne Aktionen)
//Durchschnittliche Sitzungsdauer 6:55 Amazon, 6:52 Instagram
export const avgNoPagesPerSession = 11;
const UserAgentCnt = userAgentList.length;
const lng_set1 = 'de';
const lng = 'de-DE';
const windowsGpuCnt = graphicsCardListByPlatform['Windows'].length;
const linuxGpuCnt = graphicsCardListByPlatform['Linux'].length;
const macGpuCnt = graphicsCardListByPlatform['macOS'].length;
const windowsResCnt = screenResolutionsByPlatform['Windows'].length;
const linuxResCnt = screenResolutionsByPlatform['Linux'].length;
const macResCnt = screenResolutionsByPlatform['macOS'].length;
const allowedDomains: string[] = [];
const fingerPrints: {
  [key: string]: CurrentFingerPrint;
} = {};

globalEventEmitter.on('set-allowed-domains', (domains: string[]) => {
  allowedDomains.length = 0;
  allowedDomains.push(...domains);
});
type GetPageOptions = {
  browser: Browser;
  shop: Shop;
  requestCount: number;
  disAllowedResourceTypes?: ResourceType[];
  watchedRoutes?: string[];
  exceptions?: string[];
  rules?: Rule[];
  proxyType: ProxyType;
  host: string;
}

export async function getPage({
  browser,
  shop,
  requestCount,
  disAllowedResourceTypes,
  exceptions,
  rules,
  host,
  watchedRoutes,
  proxyType,
}: GetPageOptions) {
  const page = await browser.newPage();
  
  if (watchedRoutes) {
    page.on('requestfailed', async (request) => {
      let url = request.url();
      let error = request.failure();
      if (watchedRoutes.some((route) => url.includes(route)) && error) {
        globalEventEmitter.emit('watchedRouteError', new Error(error.errorText));
      }
    });
  }
  
  initFingerPrintForHost(host);
  const fingerprint = await setPageProperties({
    page,
    shop,
    exceptions,
    host,
    requestCount,
    disAllowedResourceTypes,
    rules,
    proxyType,
  });
  
  return { page, fingerprint };
}
type PagePropertiesOptions = {
  page: Page;
  shop: Shop;
  exceptions?: string[];
  requestCount: number;
  disAllowedResourceTypes?: ResourceType[];
  rules?: Rule[];
  host: string;
  proxyType: ProxyType;
}
const setPageProperties = async ({ 
  page,
  shop,
  exceptions,
  requestCount,
  disAllowedResourceTypes,
  rules,
  host,
  proxyType,
}: PagePropertiesOptions): Promise<any> => {
  const { javascript } = shop;
  let _timezones = proxyTypeTimezones[proxyType] || timezones;
  
  await page.setRequestInterception(true);
  
  page.on('request', async (request) => {
    const requestUrl = request.url();
    const url = new URL(requestUrl);
    const resourceType = request.resourceType();
    let defaultDisallowedResourcTypes: ResourceType[] = [
      'image',
      'font',
      'media',
    ];
    if (disAllowedResourceTypes?.length) {
      defaultDisallowedResourcTypes = disAllowedResourceTypes;
    }
    if (
      exceptions &&
      exceptions.some((exception) => requestUrl.includes(exception))
    ) {
      return request.continue();
    }
    
    if (defaultDisallowedResourcTypes.includes(resourceType))
      return request.abort();
    else {
      if (shouldAbortRequest(requestUrl, rules)) {
        return request.abort();
      }
      if (isHostAllowed(url.hostname)) {
        return request.continue();
      } else {
        return request.abort();
      }
    }
  });
  
  const userAgentMeta = rotateUserAgent(requestCount, host);
  
  const { agent, platformVersion } = userAgentMeta;
  
  let platform: 'Windows' | 'macOS' | 'Linux' = 'Windows';
  let navigatorPlatform: 'MacIntel' | 'Win32' | 'Linux x86_64 X11' = 'Win32';
  let architecture: 'x64' | 'x86' | 'arm' = 'x64';
  
  if (agent.includes('X11')) {
    platform = 'Linux';
    navigatorPlatform = 'Linux x86_64 X11';
    architecture = 'x86';
  }
  if (agent.includes('Macintosh')) {
    architecture = 'x64';
    platform = 'macOS';
    navigatorPlatform = 'MacIntel';
    architecture = 'arm';
  }
  const version =
  VersionProvider.getSingleton().currentPuppeteerVersion.split('.')[0];
  
  let _agent = agent.replaceAll('<version>', version);
  
  const agentMeta = {
    architecture,
    mobile: false,
    brands: [
      { brand: 'Chromium', version: version.split('.')[0] },
      { brand: 'Google Chrome', version: version.split('.')[0] },
      { brand: 'Not_A Brand', version: '24' },
    ],
    model: '',
    platform,
    platformVersion,
  };
  
  await page.setUserAgent(_agent, agentMeta);
  
  const headers = {
    'accept-language': `${lng},${lng_set1};q=0.9`,
  };
  await page.setExtraHTTPHeaders(headers);
  
  const viewPort = rotateScreenResolution(platform, requestCount, host);
  
  await page.setViewport(viewPort);
  
  const timezone = rotateTimezone(requestCount, host, _timezones);
  
  await page.emulateTimezone(timezone);
  
  if (
    javascript?.webWorker === undefined ||
    javascript?.webWorker === 'disabled'
  ) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'Worker', {
        get: function () {
          throw new Error('Web Workers are disabled.');
        },
      });
    });
  }

  if (
    javascript?.serviceWorker === undefined ||
    javascript?.serviceWorker === 'disabled'
  ) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'serviceWorker', {
        //@ts-ignore
        register: function () {
          return Promise.reject('Service Workers are disabled.');
        },
      });
    });
  }
  if (
    javascript?.sharedWorker === undefined ||
    javascript?.sharedWorker === 'disabled'
  ) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'SharedWorker', {
        get: function () {
          throw new Error('Shared Workers are disabled.');
        },
      });
    });
  }
  if (
    javascript?.webSocket === undefined ||
    javascript?.webSocket === 'disabled'
  ) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'WebSocket', {
        get: function () {
          throw new Error('Websocket are disabled.');
        },
      });
    });
  }
};
export type CurrentFingerPrint = {
  currentUserAgent: number;
  currWinRes: number;
  currLinuxRes: number;
  currMacRes: number;
  currWinGpu: number;
  currLinuxGpu: number;
  currMacGpu: number;
  timezone: number;
};
export const initFingerPrintForHost = (
  host: string,
  random?: boolean,
  proxyType?: ProxyType,
) => {
  if (!fingerPrints[host])
    if (random) {
      fingerPrints[host] = {
        currentUserAgent: Math.floor(Math.random() * UserAgentCnt),
        currWinRes: Math.floor(Math.random() * windowsResCnt),
        currLinuxRes: Math.floor(Math.random() * linuxResCnt),
        currMacRes: Math.floor(Math.random() * macResCnt),
        currWinGpu: Math.floor(Math.random() * windowsGpuCnt),
        currLinuxGpu: Math.floor(Math.random() * linuxGpuCnt),
        currMacGpu: Math.floor(Math.random() * macGpuCnt),
        timezone: Math.floor(
          Math.random() * (proxyType === 'de' ? 0 : timezones.length),
        ),
      };
    } else {
      fingerPrints[host] = {
        currentUserAgent: 0,
        currWinRes: 0,
        currLinuxRes: 0,
        currMacRes: 0,
        currWinGpu: 0,
        currLinuxGpu: 0,
        currMacGpu: 0,
        timezone: 0,
      };
    }
};
const isNextFingerPrint = (requestCount: number) =>
  requestCount % avgNoPagesPerSession === 0;
export const rotateUserAgent = (requestCount: number, host: string) => {
  const currentUserAgent = fingerPrints[host].currentUserAgent;
  if (isNextFingerPrint(requestCount)) {
    fingerPrints[host].currentUserAgent = (currentUserAgent + 1) % UserAgentCnt;
    return userAgentList[currentUserAgent];
  } else {
    return userAgentList[currentUserAgent];
  }
};
export const rotateTimezone = (
  requestCount: number,
  host: string,
  timezones: string[],
) => {
  const timezonesCnt = timezones.length;
  const timezone = fingerPrints[host].timezone;
  if (isNextFingerPrint(requestCount)) {
    fingerPrints[host].timezone = (timezone + 1) % timezonesCnt;
    return timezones[timezone];
  } else {
    return timezones[timezone];
  }
};
export const rotateScreenResolution = (
  platform: 'Windows' | 'macOS' | 'Linux',
  requestCount: number,
  host: string,
) => {
  const screenResolutions = screenResolutionsByPlatform[platform];
  const currWinRes = fingerPrints[host].currWinRes;
  const currLinuxRes = fingerPrints[host].currLinuxRes;
  const currMacRes = fingerPrints[host].currMacRes;
  let currRes =
    platform === 'Windows'
      ? currWinRes
      : platform === 'Linux'
        ? currLinuxRes
        : currMacRes;
  if (isNextFingerPrint(requestCount) && currRes < screenResolutions.length) {
    if (platform === 'Windows') {
      currRes = (currWinRes + 1) % windowsResCnt;
      fingerPrints[host].currWinRes = currRes;
    } else if (platform === 'Linux') {
      currRes = (currLinuxRes + 1) % linuxResCnt;
      fingerPrints[host].currLinuxRes = currRes;
    } else if (platform === 'macOS') {
      currRes = (currMacRes + 1) % macResCnt;
      fingerPrints[host].currMacRes = currRes;
    }
    return screenResolutions[currRes];
  } else {
    return screenResolutions[currRes];
  }
};
export const rotateGraphicUnit = (
  platform: 'Windows' | 'macOS' | 'Linux',
  requestCount: number,
  host: string,
) => {
  const graphicsCardList = graphicsCardListByPlatform[platform];
  const currWinGpu = fingerPrints[host].currWinGpu;
  const currLinuxGpu = fingerPrints[host].currLinuxGpu;
  const currMacGpu = fingerPrints[host].currMacGpu;
  let currGraphicCard =
  platform === 'Windows'
  ? currWinGpu
  : platform === 'Linux'
  ? currLinuxGpu
  : currMacGpu;
  if (
    isNextFingerPrint(requestCount) &&
    currGraphicCard < graphicsCardList.length
  ) {
    if (platform === 'Windows') {
      currGraphicCard = (currWinGpu + 1) % windowsGpuCnt;
      fingerPrints[host].currWinGpu = currGraphicCard;
    } else if (platform === 'Linux') {
      currGraphicCard = (currLinuxGpu + 1) % linuxGpuCnt;
      fingerPrints[host].currLinuxGpu = currGraphicCard;
    } else if (platform === 'macOS') {
      currGraphicCard = (currMacGpu + 1) % macGpuCnt;
      fingerPrints[host].currMacGpu = currGraphicCard;
    }
    return graphicsCardList[currGraphicCard];
  } else {
    return graphicsCardList[currGraphicCard];
  }
};
export function isHostAllowed(hostname: string) {
  return allowedDomains.some((domain) => hostname.includes(domain));
}


