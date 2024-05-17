import { Browser, Page, ResourceType } from 'puppeteer1';
import {
  acceptEncodingList,
  acceptList,
  graphicsCardListByPlatform,
  languageList,
  languagesLists,
  pluginList,
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

const setPageProperties = async (
  page: Page,
  exceptions: string[] = [],
  requestCount: number | null,
  disAllowedResourceTypes?: ResourceType[],
  rules?: Rule[],
) => {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    const requestUrl = request.url();
    let defaultDisallowedResourcTypes: ResourceType[] = [
      'image',
      'font',
      'media',
    ];
    if (disAllowedResourceTypes?.length) {
      defaultDisallowedResourcTypes = disAllowedResourceTypes;
    }
    if (exceptions.some((exception) => requestUrl.includes(exception))) {
      return request.continue();
    }

    if (defaultDisallowedResourcTypes.includes(resourceType))
      return request.abort();
    else {
      if (shouldAbortRequest(requestUrl, rules)) {
        return request.abort();
      }
      return request.continue();
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

  const _agent = agent.replaceAll('<version>', version);

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

  await page.emulateTimezone(sample(timezones) ?? 'America/New_York');

  const languages = requestCount
    ? languagesLists[requestCount % languagesLists.length]
    : sample(languagesLists) ?? languagesLists[0];

  const language = requestCount
    ? languageList[requestCount % languageList.length]
    : sample(languageList) ?? languageList[0];

  await page.evaluateOnNewDocument(
    (lng, lng_set1, navigatorPlatform, languages, language) => {
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
    lng,
    lng_set1,
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

  await page.evaluateOnNewDocument((viewPort) => {
    Object.defineProperty(window, 'outerHeight', {
      get: function () {
        return viewPort.height;
      },
    });
    Object.defineProperty(window, 'outerWidth', {
      get: function () {
        return viewPort.width;
      },
    });
    Object.defineProperty(screen, 'availHeight', {
      get: function () {
        return viewPort.height;
      },
    });
    Object.defineProperty(screen, 'availWidth', {
      get: function () {
        return viewPort.width;
      },
    });
    Object.defineProperty(screen, 'height', {
      get: function () {
        return viewPort.height;
      },
    });
    Object.defineProperty(screen, 'width', {
      get: function () {
        return viewPort.width;
      },
    });
  }, viewPort);

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
    window.navigator.chrome = {
      app: {
        isInstalled: false,
      },
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

  // await page.evaluateOnNewDocument(() => {
  //   function addDebugflag() {}
  //   let descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), 'hardwareConcurrency')
  //   //@ts-ignore
  //   let descriptorProp = descriptor.get!
  //   Object.defineProperty(navigator, 'hardwareConcurrency', {
  //     get: function (this: Navigator) {
  //       addDebugflag();
  //       return Reflect.apply(descriptorProp, this, arguments);
  //     },
  //   });
  // });

  const graphicCard = requestCount
    ? rotateGraphicUnit(platform, requestCount)
    : graphicsCardListByPlatform['Windows'][0];

  await page.evaluateOnNewDocument((graphicCard) => {
    WebGLRenderingContext.prototype.getParameter = (function (origFn) {
      const paramMap: { [key: string]: string } = {};
      paramMap[0x9245] = graphicCard.vendor;
      paramMap[0x9246] = graphicCard.renderer;
      return function (this: WebGL2RenderingContext, parameter) {
        return paramMap[parameter] || origFn.call(this, parameter);
      };
    })(WebGLRenderingContext.prototype.getParameter);
    WebGL2RenderingContext.prototype.getParameter = (function (origFn) {
      const paramMap: { [key: string]: string } = {};
      paramMap[0x9245] = graphicCard.vendor;
      paramMap[0x9246] = graphicCard.renderer;
      return function (this: WebGL2RenderingContext, parameter) {
        return paramMap[parameter] || origFn.call(this, parameter);
      };
    })(WebGL2RenderingContext.prototype.getParameter);
  }, graphicCard);

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'Worker', {
      get: function () {
        throw new Error('Web Workers are disabled.');
      },
    });
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      //@ts-ignore
      register: function () {
        return Promise.reject('Service Workers are disabled.');
      },
    });
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'SharedWorker', {
      get: function () {
        throw new Error('Shared Workers are disabled.');
      },
    });
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'Websocket', {
      get: function () {
        throw new Error('Shared Workers are disabled.');
      },
    });
  });
};

export async function getPage(
  browser: Browser,
  requestCount: number | null,
  disAllowedResourceTypes?: ResourceType[],
  exceptions?: string[],
  rules?: Rule[],
) {
  const page = await browser.newPage();

  await setPageProperties(
    page,
    exceptions,
    requestCount,
    disAllowedResourceTypes,
    rules,
  );

  return page;
}
