import { Browser, Page, ResourceType } from 'puppeteer';
import { screenResolutions, userAgentList } from '../constants';
import { sample } from 'underscore';
import { shouldAbortRequest } from './pageHelper';
import { Rule } from '../types/rules';

const setPageProperties = async (
  page: Page,
  exceptions: string[] = [],
  disAllowedResourceTypes?: ResourceType[],
  rules?: Rule[],
) => {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', {
      get: function () {
        return 'de-DE';
      },
    });
    Object.defineProperty(navigator, 'languages', {
      get: function () {
        return ['de-DE', 'de'];
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
  const agent = sample(userAgentList) || userAgentList[0];
  let platform = '';
  if (agent.includes('Windows')) {
    platform = 'Windows';
  }
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
    'accept-language': 'de-DE,de;q=0.9',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'sec-ch-ua-platform': platform,
  });
  await page.setViewport(
    sample(screenResolutions) ?? { height: 1920, width: 1080 },
  );
  await page.setBypassCSP(true);
};

export async function getPage(
  browser: Browser,
  disAllowedResourceTypes?: ResourceType[],
  exceptions?: string[],
  rules?: Rule[],
) {
  const page = await browser.newPage();

  await setPageProperties(page, exceptions, disAllowedResourceTypes, rules);

  return page;
}
