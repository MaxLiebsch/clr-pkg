import { Browser, Page, ResourceType } from 'puppeteer';
import {
  CHROME_VERSION,
  screenResolutions,
  screenResolutionsByPlatform,
  userAgentList,
} from '../constants';
import { sample } from 'underscore';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../types/rules';
import { secure } from 'secure-puppeteer';

//Amazon has 9,5 pages per session, Instagram 11,6
//Absprungrate 35,1% Amazon, 35,8% Instagram (Seite wird wieder verlassen ohne Aktionen)
//Durchschnittliche Sitzungsdauer 6:55 Amazon, 6:52 Instagram
export const averageNumberOfPagesPerSession = 11;
const UserAgentCnt = userAgentList.length;
const windowsResCnt = screenResolutionsByPlatform['Windows'].length;
const linuxResCnt = screenResolutionsByPlatform['Linux'].length;
const macResCnt = screenResolutionsByPlatform['macOS'].length;
const lng_set1 = 'de';
const lng = 'de-DE';

let currentUserAgent = 0;

const rotateUserAgent = (requestCount: number) => {
  if (requestCount < averageNumberOfPagesPerSession) {
    return userAgentList[currentUserAgent];
  } else {
    currentUserAgent = (currentUserAgent + 1) % UserAgentCnt;
    return userAgentList[currentUserAgent];
  }
};

let currWinRes = 0;
let currLinuxRes = 0;
let currMacRes = 0;

const rotateScreenResolution = (
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
    } else if (platform === 'Linux') {
      currRes = (currLinuxRes + 1) % linuxResCnt;
    } else if (platform === 'macOS') {
      currRes = (currMacRes + 1) % macResCnt;
    }
    return screenResolutions[currRes];
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
    let defaultDisallowedResourcTypes = ['image', 'font', 'media'];
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
  let navigatorPlatform: 'MacIntel' | 'Win32' | 'Linux x86_64' = 'Win32';
  if (agent.includes('X11')) {
    platform = 'Linux';
    navigatorPlatform = 'Linux x86_64';
  }
  if (agent.includes('Macintosh')) {
    platform = 'macOS';
    navigatorPlatform = 'MacIntel';
  }

  const agentMeta = {
    architecture:
      platform === 'Windows' || platform === 'Linux' ? 'x86_64' : 'arm',
    mobile: false,
    brands: [
      { brand: 'Chromium', version: CHROME_VERSION.split('.')[0] },
      { brand: 'Google Chrome', version: CHROME_VERSION.split('.')[0] },
      { brand: 'Not-A.Brand', version: '99' },
    ],
    model: '',
    platform: platform,
    platformVersion,
  };

  await page.setUserAgent(agent, agentMeta);
  await page.setExtraHTTPHeaders({
    'cache-control': 'max-age=0',
    'sec-ch-ua-platform': platform,
    'sec-ch-ua-form-factors': 'Desktop',
    'upgrade-insecure-requests': '1',
  });
  await page.setExtraHTTPHeaders({
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Sec-Fetch-Site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    Referer: 'https://www.google.com',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': `${lng},${lng_set1};q=0.9`,
    'sec-gpc': '1',
  });

  const viewPort = requestCount
    ? rotateScreenResolution(platform, requestCount)
    : sample(screenResolutions) ?? screenResolutions[0];

  await page.setViewport(viewPort);
  await page.setBypassCSP(true);
  const timezones = ['Europe/Kiev', 'Europe/Moscow', 'America/New_York'];
  await page.emulateTimezone(sample(timezones) ?? 'Europe/Kiev');
  await page.evaluateOnNewDocument(
    (lng, lng_set1, navigatorPlatform) => {
      Object.defineProperty(navigator, 'language', {
        get: function () {
          return lng;
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
          return [lng];
        },
      });
    },
    lng,
    lng_set1,
    navigatorPlatform,
  );
};

export async function getPage(
  browser: Browser,
  requestCount: number | null,
  disAllowedResourceTypes?: ResourceType[],
  exceptions?: string[],
  rules?: Rule[],
) {
  const page = secure(await browser.newPage());

  await setPageProperties(
    page,
    exceptions,
    requestCount,
    disAllowedResourceTypes,
    rules,
  );

  return page;
}
