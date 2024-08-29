import { Browser, Page, ResourceType } from 'puppeteer1';
import {
  acceptEncodingList,
  acceptList,
  graphicsCardListByPlatform,
  languageList,
  languagesLists,
  screenResolutions,
  screenResolutionsByPlatform,
  timezones,
  userAgentList,
  voicesList,
} from '../../constants';
import { sample, shuffle } from 'underscore';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../../types/rules';
import { shuffleObject } from './shuffleHeader';
import { VersionProvider } from '../versionProvider';
import { ShopObject } from '../../types';
import { ProxyType } from '../../types/proxyAuth';
import { allowed } from '../../static/allowed';

const WebGlVendor = require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');

//Amazon has 9,5 pages per session, Instagram 11,6
//Absprungrate 35,1% Amazon, 35,8% Instagram (Seite wird wieder verlassen ohne Aktionen)
//Durchschnittliche Sitzungsdauer 6:55 Amazon, 6:52 Instagram
export const averageNumberOfPagesPerSession = 11;
const UserAgentCnt = userAgentList.length;
const lng_set1 = 'de';
const lng = 'de-DE';

let currentUserAgent = 0;

export const rotateUserAgent = (requestCount: number) => {
  if (requestCount < averageNumberOfPagesPerSession) {
    return userAgentList[currentUserAgent];
  } else {
    currentUserAgent = (currentUserAgent + 1) % UserAgentCnt;
    return userAgentList[currentUserAgent];
  }
};

// extraLauncher.use(StealthPlugin())

let currWinRes = 0;
let currLinuxRes = 0;
let currMacRes = 0;
const windowsResCnt = screenResolutionsByPlatform['Windows'].length;
const linuxResCnt = screenResolutionsByPlatform['Linux'].length;
const macResCnt = screenResolutionsByPlatform['macOS'].length;

export const rotateScreenResolution = (
  platform: 'Windows' | 'macOS' | 'Linux',
  requestCount: number,
) => {
  const screenResolutions = screenResolutionsByPlatform[platform];
  let currRes =
    platform === 'Windows'
      ? currWinRes
      : platform === 'Linux'
        ? currLinuxRes
        : currMacRes;
  if (
    requestCount < averageNumberOfPagesPerSession &&
    currRes < screenResolutions.length
  ) {
    return screenResolutions[currRes];
  } else {
    if (platform === 'Windows') {
      currRes = (currWinRes + 1) % windowsResCnt;
      currWinRes = currRes;
    } else if (platform === 'Linux') {
      currRes = (currLinuxRes + 1) % linuxResCnt;
      currLinuxRes = currRes;
    } else if (platform === 'macOS') {
      currRes = (currMacRes + 1) % macResCnt;
      currMacRes = currRes;
    }
    return screenResolutions[currRes];
  }
};

let currWinGpu = 0;
let currLinuxGpu = 0;
let currMacGpu = 0;
const windowsGpuCnt = graphicsCardListByPlatform['Windows'].length;
const linuxGpuCnt = graphicsCardListByPlatform['Linux'].length;
const macGpuCnt = graphicsCardListByPlatform['macOS'].length;

export const rotateGraphicUnit = (
  platform: 'Windows' | 'macOS' | 'Linux',
  requestCount: number,
) => {
  const graphicsCardList = graphicsCardListByPlatform[platform];
  let currGraphicCard =
    platform === 'Windows'
      ? currWinGpu
      : platform === 'Linux'
        ? currLinuxGpu
        : currMacGpu;
  if (
    requestCount < averageNumberOfPagesPerSession &&
    currGraphicCard < graphicsCardList.length
  ) {
    return graphicsCardList[currGraphicCard];
  } else {
    if (platform === 'Windows') {
      currGraphicCard = (currWinGpu + 1) % windowsGpuCnt;
      currWinGpu = currGraphicCard;
    } else if (platform === 'Linux') {
      currGraphicCard = (currLinuxGpu + 1) % linuxGpuCnt;
      currLinuxGpu = currGraphicCard;
    } else if (platform === 'macOS') {
      currGraphicCard = (currMacGpu + 1) % macGpuCnt;
      currMacGpu = currGraphicCard;
    }
    return graphicsCardList[currGraphicCard];
  }
};

interface PagePropertiesOptions {
  page: Page;
  shop: ShopObject;
  exceptions?: string[];
  requestCount: number | null;
  disAllowedResourceTypes?: ResourceType[];
  rules?: Rule[];
  customTimezones?: string[];
  proxyType?: ProxyType;
}

export async function changeRequestProxy(
  proxyType: ProxyType,
  link: string,
  cnt: number = 1,
) {
  const host = new URL(link).hostname;
  const response = await fetch(
    `http://127.0.0.1:8080/notify?proxy=${proxyType}&host=${host}&cnt=${cnt}`,
  );
  if (response.status === 200) {
    return response;
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export function isHostAllowed(hostname: string) {
  return allowed.some((domain) => hostname.includes(domain));
}

const setPageProperties = async ({
  page,
  shop,
  exceptions,
  requestCount,
  disAllowedResourceTypes,
  rules,
  customTimezones,
  proxyType,
}: PagePropertiesOptions) => {
  const { javascript } = shop;
  let _timezones = customTimezones ?? timezones;

  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const requestUrl = request.url();
    const url = new URL(requestUrl);
    if (proxyType) await changeRequestProxy(proxyType, requestUrl);
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
      if (proxyType) await changeRequestProxy(proxyType, requestUrl);
      return request.continue();
    }

    if (defaultDisallowedResourcTypes.includes(resourceType))
      return request.abort();
    else {
      if (shouldAbortRequest(requestUrl, rules)) {
        return request.abort();
      }
      if (isHostAllowed(url.hostname)) {
        if (proxyType) await changeRequestProxy(proxyType, requestUrl);
        return request.continue();
      } else {
        return request.abort();
      }
    }
  });

  const userAgentMeta = requestCount
    ? rotateUserAgent(requestCount)
    : sample(userAgentList) ?? userAgentList[0];

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
      { brand: 'Chromium', version },
      { brand: 'Google Chrome', version },
      { brand: 'Not-A.Brand', version: '99' },
    ],
    model: '',
    platform,
    platformVersion,
  };

  await page.setUserAgent(_agent, agentMeta);

  const accpetEncoding = requestCount
    ? acceptEncodingList[requestCount % acceptEncodingList.length]
    : sample(acceptEncodingList) ?? acceptEncodingList[0];

  const accept = requestCount
    ? acceptList[requestCount % acceptList.length]
    : sample(acceptList) ?? acceptList[0];

  const headers = {
    'upgrade-insecure-requests': '1',
    'cache-control': 'max-age=0',
    'sec-ch-ua-platform': platform,
    'sec-ch-ua-form-factors': 'Desktop',
    accept,
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': accpetEncoding,
    'accept-language': `${lng},${lng_set1};q=0.9`,
    'sec-gpc': '1',
  };
  const shuffledHeaders = shuffleObject(headers);
  await page.setExtraHTTPHeaders(shuffledHeaders);

  const viewPort = requestCount
    ? rotateScreenResolution(platform, requestCount)
    : sample(screenResolutions) ?? screenResolutions[0];

  await page.setViewport(viewPort);

  await page.setBypassCSP(true);

  const timezone = requestCount
    ? _timezones[requestCount % _timezones.length]
    : sample(_timezones) ?? 'America/New_York';

  await page.emulateTimezone(timezone);

  const languages = requestCount
    ? languagesLists[requestCount % languagesLists.length]
    : sample(languagesLists) ?? languagesLists[0];

  const language = requestCount
    ? languageList[requestCount % languageList.length]
    : sample(languageList) ?? languageList[0];

  await page.evaluateOnNewDocument(
    (navigatorPlatform, languages, language) => {
      Object.defineProperty(navigator, 'language', {
        get: function () {
          return language;
        },
      });
      Object.defineProperty(navigator, 'platform', {
        get: function () {
          return navigatorPlatform;
        },
        set: function (a) {},
      });
      Object.defineProperty(navigator, 'languages', {
        get: function () {
          return languages;
        },
      });
    },
    navigatorPlatform,
    languages,
    language,
  );

  const voices = requestCount
    ? voicesList.slice(requestCount % voicesList.length, undefined)
    : shuffle(voicesList).slice(0, 5);

  if (voices.length < 6 && requestCount) {
    let i = 0;
    while (voices.length < 5) {
      voices.push(voicesList[i]);
      i++;
    }
  }
  if (voices.some((voice) => !voice.default)) {
    voices[0].default = true;
  }

  await page.evaluateOnNewDocument((voices) => {
    Object.defineProperty(speechSynthesis, 'getVoices', {
      get: function () {
        return () => voices;
      },
    });
  }, voices);

  // await page.evaluateOnNewDocument((viewPort) => {
  // //   Object.defineProperty(screen, 'availHeight', {
  // //     get: function () {
  // //       return viewPort.height;
  // //     },
  // //   });
  // //   Object.defineProperty(screen, 'availWidth', {
  // //     get: function () {
  // //       return viewPort.width;
  // //     },
  // //   });
  // //   Object.defineProperty(screen, 'width', {
  // //     get: function () {
  // //       return viewPort.width - 384;
  // //     },
  // //   });
  // //   // //@ts-ignore
  // //   // screen.height = viewPort.height;
  // //   // //@ts-ignore
  // //   // screen.width = viewPort.width;
  // //   window.outerHeight = viewPort.height - 120;
  // //   window.outerWidth = viewPort.width - 384;

  // }, viewPort);

  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    //@ts-ignore
    return (window.navigator.permissions.query = (parameters) => {
      if (parameters.name === 'notifications') {
        return Promise.resolve({ state: 'prompt' });
      } else if (parameters.name === 'geolocation') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'accelerometer') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'background-fetch') {
        return Promise.resolve({ state: 'granted' });
        //@ts-ignore
      } else if (parameters.name === 'background-sync') {
        return Promise.resolve({ state: 'granted' });
        //@ts-ignore
      } else if (parameters.name === 'clipboard-write') {
        return Promise.resolve({ state: 'granted' });
        //@ts-ignore
      } else if (parameters.name === 'display-capture') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'camera') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'microphone') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'clipboard-read') {
        return Promise.resolve({ state: 'granted' });
        //@ts-ignore
      } else if (parameters.name === 'gyroscope') {
        return Promise.resolve({ state: 'granted' });
        //@ts-ignore
      } else if (parameters.name === 'midi') {
        return Promise.resolve({ state: 'granted' });
      } else if (parameters.name === 'persistent-storage') {
        return Promise.resolve({ state: 'prompt' });
        //@ts-ignore
      } else if (parameters.name === 'magnetometer') {
        return Promise.resolve({ state: 'granted' });
      } else {
        return originalQuery(parameters);
      }
    });
  });

  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    //@ts-ignore
    delete navigator.__proto__.webdriver;
    console.log = function () {}; // Disable console.log temporarily
    // Override the Error stack getter to prevent detection
    Object.defineProperty(Error.prototype, 'stack', {
      get: function () {
        return ''; // Return an empty string or a custom stack
      },
    });

    //@ts-ignore
    window.navigator.chrome = {
      //@ts-ignore
      ...window.navigator.chrome,
      webstore: {
        onInstallStageChanged: {},
        onDownloadProgress: {},
      },
      runtime: {
        PlatformOs: {
          MAC: 'mac',
          WIN: 'win',
          ANDROID: 'android',
          CROS: 'cros',
          LINUX: 'linux',
          OPENBSD: 'openbsd',
        },
        PlatformArch: {
          ARM: 'arm',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
        },
        PlatformNaclArch: {
          ARM: 'arm',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
        },
        RequestUpdateCheckStatus: {
          THROTTLED: 'throttled',
          NO_UPDATE: 'no_update',
          UPDATE_AVAILABLE: 'update_available',
        },
        OnInstalledReason: {
          INSTALL: 'install',
          UPDATE: 'update',
          CHROME_UPDATE: 'chrome_update',
          SHARED_MODULE_UPDATE: 'shared_module_update',
        },
        OnRestartRequiredReason: {
          APP_UPDATE: 'app_update',
          OS_UPDATE: 'os_update',
          PERIODIC: 'periodic',
        },
      },
    };
  });

  const graphicCard = requestCount
    ? rotateGraphicUnit(platform, requestCount)
    : graphicsCardListByPlatform['Windows'][0];

  await new WebGlVendor(graphicCard).onPageCreated(page);

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
      Object.defineProperty(navigator, 'serviceWorker', {
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

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'Websocket', {
      get: function () {
        throw new Error('Websocket are disabled.');
      },
    });
  });
};

interface GetPageOptions {
  browser: Browser;
  shop: ShopObject;
  requestCount: number | null;
  disAllowedResourceTypes?: ResourceType[];
  exceptions?: string[];
  rules?: Rule[];
  timezones?: string[];
  proxyType?: ProxyType;
}

export async function getPage({
  browser,
  shop,
  requestCount,
  disAllowedResourceTypes,
  exceptions,
  rules,
  timezones,
  proxyType,
}: GetPageOptions) {
  const page = await browser.newPage();

  await setPageProperties({
    page,
    shop,
    exceptions,
    requestCount,
    disAllowedResourceTypes,
    rules,
    customTimezones: timezones,
    proxyType,
  });

  return page;
}
