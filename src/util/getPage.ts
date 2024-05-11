import { Browser, Page, ResourceType } from 'puppeteer';
import {
  screenResolutions,
  screenResolutionsByPlatform,
  userAgentList,
} from '../constants';
import { sample } from 'underscore';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../types/rules';

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
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    Object.defineProperty(navigator, 'language', {
      get: function () {
        return lng;
      },
    });
    Object.defineProperty(navigator, 'languages', {
      get: function () {
        return [lng, lng_set1];
      },
    });
  });
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
  const agent = requestCount
    ? rotateUserAgent(requestCount)
    : sample(userAgentList) ?? userAgentList[0];
  await page.setUserAgent(agent);

  let platform: 'Windows' | 'macOS' | 'Linux' = 'Windows';
  if (agent.includes('Linux')) {
    platform = 'Linux';
  }
  if (agent.includes('Macintosh')) {
    platform = 'macOS';
  }

  await page.setExtraHTTPHeaders({
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': `${lng},${lng_set1};q=0.9`,
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'sec-ch-ua-platform': platform,
  });

  const viewPort = requestCount
    ? rotateScreenResolution(platform, requestCount)
    : sample(screenResolutions) ?? screenResolutions[0];

  await page.setViewport(viewPort);
  await page.setBypassCSP(true);
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
