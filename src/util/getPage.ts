import { Browser, Page, ResourceType } from "puppeteer";
import { ProxyAuth } from "../types/proxyAuth";
import { userAgentList } from "../constants";
import { sample } from "underscore";

const setPageProperties = async (
    page: Page,
    disAllowedResourceTypes?: ResourceType[],
    lng: string = 'de',
  ) => {
  
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      let defaultDisallowedResourcTypes = ['image', 'font', 'media'];
      if (disAllowedResourceTypes?.length) {
        defaultDisallowedResourcTypes = disAllowedResourceTypes;
      }
      if (defaultDisallowedResourcTypes.includes(resourceType))
        return request.abort();
      else {
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
    if (agent.includes('macOS')) {
      platform = 'macOS';
    }
  
    await page.setUserAgent(agent);
    await page.setExtraHTTPHeaders({
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en,de-DE;q=0.9,de;q=0.8,en-US;q=0.7',
      'Cache-Control': 'max-age=0',
      'upgrade-insecure-requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Sec-GPC': '1',
      'Sec-CH-UA-Platform': platform,
    });
    page.setDefaultNavigationTimeout(180000);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setBypassCSP(true);
  };
  
  export async function getPage(
    browser: Browser,
    proxyAuth: ProxyAuth,
    disAllowedResourceTypes?: ResourceType[],
    lng: string = 'de',
  ) {
    // const context = await browser.createBrowserContext();
    const page = await browser.newPage();
  
    await setPageProperties(page, disAllowedResourceTypes, lng);
  
    return page;
  }