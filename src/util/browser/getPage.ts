import { Browser, Page, ResourceType } from 'rebrowser-puppeteer';
import {
  graphicsCardListByPlatform,
  screenResolutionsByPlatform,
  timezones,
  userAgentList,
} from '../../constants';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../../types/rules';
import { allowed } from '../../static/allowed';
import { Shop } from '../../types/shop';
import { ProxyType } from '../../types/proxyAuth';


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

const fingerPrints: {
  [key: string]: CurrentFingerPrint;
} = {};

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

interface PagePropertiesOptions {
  page: Page;
  shop: Shop;
  exceptions?: string[];
  requestCount: number;
  disAllowedResourceTypes?: ResourceType[];
  rules?: Rule[];
  host: string;
  proxyType?: ProxyType;
}

export function isHostAllowed(hostname: string) {
  return allowed.some((domain) => hostname.includes(domain));
}

interface FingerPrint {
  agent: string;
  viewPort: { width: number; height: number };
  graphicCard: { renderer: string; vendor: string };
  timezone: string;
  languages: string[];
  language: string;
  voices: string;
  accept: string;
  acceptEncoding: string;
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
  let _timezones = proxyType === 'de' ? ['Europe/Berlin'] : timezones;

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

  // const userAgentMeta = rotateUserAgent(requestCount, host);

  // const { agent, platformVersion } = userAgentMeta;

  // let platform: 'Windows' | 'macOS' | 'Linux' = 'Windows';
  // let navigatorPlatform: 'MacIntel' | 'Win32' | 'Linux x86_64 X11' = 'Win32';
  // let architecture: 'x64' | 'x86' | 'arm' = 'x64';

  // if (agent.includes('X11')) {
  //   platform = 'Linux';
  //   navigatorPlatform = 'Linux x86_64 X11';
  //   architecture = 'x86';
  // }
  // if (agent.includes('Macintosh')) {
  //   architecture = 'x64';
  //   platform = 'macOS';
  //   navigatorPlatform = 'MacIntel';
  //   architecture = 'arm';
  // }
  // const version =
  //   VersionProvider.getSingleton().currentPuppeteerVersion.split('.')[0];

  // let _agent = agent.replaceAll('<version>', version);

  // const agentMeta = {
  //   architecture,
  //   mobile: false,
  //   brands: [
  //     { brand: 'Chromium', version },
  //     { brand: 'Google Chrome', version },
  //     { brand: 'Not-A.Brand', version: '99' },
  //   ],
  //   model: '',
  //   platform,
  //   platformVersion,
  // };

  // await page.setUserAgent(_agent, agentMeta);

  // const acceptEncoding =
  //   acceptEncodingList[requestCount % acceptEncodingList.length];

  // const accept = acceptList[requestCount % acceptList.length];

  // const headers = {
  //   'sec-ch-ua-platform': platform,
  //   'accept-language': `${lng},${lng_set1};q=0.9`,
  // };
  // await page.setExtraHTTPHeaders(headers);

  // const viewPort = rotateScreenResolution(platform, requestCount, host);

  // await page.setViewport(viewPort);

  const timezone = rotateTimezone(requestCount, host, _timezones);

  await page.emulateTimezone(timezone);

  // const languages = languagesLists[requestCount % languagesLists.length];
  // const language = languageList[requestCount % languageList.length];

  // const voices = voicesList.slice(requestCount % voicesList.length, undefined);

  // if (voices.length < 6 && requestCount) {
  //   let i = 0;
  //   while (voices.length < 5) {
  //     voices.push(voicesList[i]);
  //     i++;
  //   }
  // }
  // if (voices.some((voice) => !voice.default)) {
  //   voices[0].default = true;
  // }

  // await page.evaluateOnNewDocument((voices) => {
  //   Object.defineProperty(speechSynthesis, 'getVoices', {
  //     get: function () {
  //       return () => voices;
  //     },
  //   });
  // }, voices);

  // await page.evaluateOnNewDocument(() => {
  //   const originalQuery = window.navigator.permissions.query;
  //   //@ts-ignore
  //   return (window.navigator.permissions.query = (parameters) => {
  //     if (parameters.name === 'notifications') {
  //       return Promise.resolve({ state: 'prompt' });
  //     } else if (parameters.name === 'geolocation') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'accelerometer') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'background-fetch') {
  //       return Promise.resolve({ state: 'granted' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'background-sync') {
  //       return Promise.resolve({ state: 'granted' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'clipboard-write') {
  //       return Promise.resolve({ state: 'granted' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'display-capture') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'camera') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'microphone') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'clipboard-read') {
  //       return Promise.resolve({ state: 'granted' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'gyroscope') {
  //       return Promise.resolve({ state: 'granted' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'midi') {
  //       return Promise.resolve({ state: 'granted' });
  //     } else if (parameters.name === 'persistent-storage') {
  //       return Promise.resolve({ state: 'prompt' });
  //       //@ts-ignore
  //     } else if (parameters.name === 'magnetometer') {
  //       return Promise.resolve({ state: 'granted' });
  //     } else {
  //       return originalQuery(parameters);
  //     }
  //   });
  // });

  // await page.evaluateOnNewDocument(() => {
  //   // We can mock this in as much depth as we need for the test.
  //   console.log = function () {}; // Disable console.log temporarily
  //   // Override the Error stack getter to prevent detection
  //   Object.defineProperty(Error.prototype, 'stack', {
  //     get: function () {
  //       return ''; // Return an empty string or a custom stack
  //     },
  //   });
  // });

  // const graphicCard = rotateGraphicUnit(platform, requestCount, host);

  // await new WebGlVendor(graphicCard).onPageCreated(page);

  // if (
  //   javascript?.webWorker === undefined ||
  //   javascript?.webWorker === 'disabled'
  // ) {
  //   await page.evaluateOnNewDocument(() => {
  //     Object.defineProperty(window, 'Worker', {
  //       get: function () {
  //         throw new Error('Web Workers are disabled.');
  //       },
  //     });
  //   });
  // }

  // if (
  //   javascript?.serviceWorker === undefined ||
  //   javascript?.serviceWorker === 'disabled'
  // ) {
  //   await page.evaluateOnNewDocument(() => {
  //     Object.defineProperty(window, 'serviceWorker', {
  //       //@ts-ignore
  //       register: function () {
  //         return Promise.reject('Service Workers are disabled.');
  //       },
  //     });
  //   });
  // }
  // if (
  //   javascript?.sharedWorker === undefined ||
  //   javascript?.sharedWorker === 'disabled'
  // ) {
  //   await page.evaluateOnNewDocument(() => {
  //     Object.defineProperty(window, 'SharedWorker', {
  //       get: function () {
  //         throw new Error('Shared Workers are disabled.');
  //       },
  //     });
  //   });
  // }

  // await page.evaluateOnNewDocument(() => {
  //   Object.defineProperty(window, 'Websocket', {
  //     get: function () {
  //       throw new Error('Websocket are disabled.');
  //     },
  //   });
  // });

  // return {
  //   agent: _agent,
  //   viewPort,
  //   graphicCard,
  //   timezone,
  //   languages,
  //   language,
  //   accept,
  //   acceptEncoding,
  //   voices: '',
  // };
};

interface GetPageOptions {
  browser: Browser;
  shop: Shop;
  requestCount: number;
  disAllowedResourceTypes?: ResourceType[];
  exceptions?: string[];
  rules?: Rule[];
  proxyType?: ProxyType;
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
  proxyType,
}: GetPageOptions) {
  const page = await browser.newPage();
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
