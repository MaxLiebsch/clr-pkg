import { CheerioAPI, load } from 'cheerio';
import {
  Candidate,
  FailedPage,
  ImgMeta,
  ProductInfoRequestResponse,
  SearchProductWithPZNResponse,
  ShopObject,
} from '../../types';
import * as _ from 'underscore';
import { proxies, userAgentList } from '../../constants';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import url, { URL } from 'url';
import {
  linkPassedURLShopCriteria,
  removeRandomKeywordInURL,
  sanitizedURL,
} from '../sanitize';
import { antiKeywords } from '../../constants/index';
import { BrowserInfo } from '../../types/index';
import { deliveryTime } from '../deliveryTImeCleansing';
import { get } from 'lodash';
import { jsonrepair } from 'jsonrepair';
import mime from 'mime-types';
import { TimeoutError } from 'puppeteer1';
import { ProxyAuth } from '../../types/proxyAuth';
import { closePage } from '../browser/closePage';
import { getPage } from '../browser/getPage';
import { extractFromVariousLocations } from './extractFromVariousLocations';

const collectInternalLinks = (
  $: CheerioAPI,
  shop: ShopObject,
  url: string,
): string[] => {
  const { d, ece, ap } = shop;
  let links: string[] = [];
  const elements =
    "a[href^='http://" +
    d +
    "']:not(a[href^='mailto']), " +
    "a[href^='https://" +
    d +
    "']:not(a[href^='mailto']), " +
    "a[href^='https://www." +
    d +
    "']:not(a[href^='mailto']), " +
    "a[href^='http://www." +
    d +
    "']:not(a[href^='mailto']), " +
    "a[href^='/']:not(a[href^='mailto']), " +
    "a[href^='?']:not(a[href^='mailto']), " +
    "a[href^='&']:not(a[href^='mailto'])";

  const relativeLinks = $(elements);

  relativeLinks.each(function (i: number, e: any) {
    let href = $(this).attr('href');
    if (href !== undefined && linkPassedURLShopCriteria(href, ap)) {
      const link = href;
      if (
        !antiKeywords
          .filter((antiKeyword) => !shop.d.includes(antiKeyword))
          .some((el: string) => link.toLowerCase().indexOf(el) !== -1)
      ) {
        const _sensitizedURL = sanitizedURL(link, d, url);
        const cleaned = removeRandomKeywordInURL(_sensitizedURL, ece);
        !links.includes(cleaned) && links.push(cleaned);
      }
    }
  });
  return links;
};

const formImageLinks = (url: string, imgMeta?: ImgMeta) => {
  if (!imgMeta) return url;
  if (!url.startsWith('https://')) {
    url = imgMeta.baseurl + url;
  }

  const imgRegex = new RegExp(imgMeta.imgRegex);
  const match = extractRegexFromString(url, imgRegex);
  if (match) {
    return imgMeta?.suffix
      ? imgMeta.baseurl + match + imgMeta.suffix
      : imgMeta.baseurl + match;
  } else {
    return imgMeta?.suffix ? url + imgMeta.suffix : url;
  }
};

const imageLinks = (
  $: CheerioAPI,
  raw_selector: string[],
  urlRegex: RegExp,
  imgMeta?: ImgMeta,
) => {
  const imageSources: string[] = [];
  raw_selector.forEach((selector) => {
    $(selector).each(function () {
      const src = $(this).attr('src');
      const datalazy = $(this).attr('data-lazy');
      if (src && imageSources.indexOf(src) === -1) {
        const match = extractRegexFromString(decodeURIComponent(src), urlRegex);
        imageSources.push(formImageLinks(match ?? src, imgMeta));
      }
      if (datalazy && imageSources.indexOf(datalazy) === -1) {
        const match = extractRegexFromString(
          decodeURIComponent(datalazy),
          urlRegex,
        );
        imageSources.push(formImageLinks(match ?? datalazy));
      }
    });
  });
  return imageSources;
};

export const extractInfoFromScript = (
  $: CheerioAPI,
  raw_selector: string,
): string | undefined => {
  const selector = raw_selector.split(';')[0];
  const path = raw_selector.split(';')[1];
  const regex = raw_selector.split(';')[2];
  let parsedPath = path;
  let value;
  //@ts-ignore
  const jsonRaws = $(selector);
  if (regex) {
    const match = extractRegexFromString(
      jsonRaws.text(),
      new RegExp(regex, 'gm'),
    );
    if (match) {
      return match.replace(/\D+/g, '');
    }
  }
  for (let index = 0; index < jsonRaws.length; index++) {
    try {
      //@ts-ignore
      const data = jsonRaws[index].children[0].data.trim();
      const repaired = jsonrepair(data);
      const content = JSON.parse(repaired);
      if (path?.startsWith && path.startsWith('[')) {
        parsedPath = JSON.parse(path.trim());
      }
      if (content instanceof Array) {
        content.forEach((contentItem) => {
          const _value = get(contentItem, parsedPath);
          if (_value instanceof Array) {
            value = _value[0].value;
          } else if (_value !== undefined) {
            value = _value;
          }
        });
      } else {
        const _value = get(content, parsedPath);
        if (_value instanceof Array) {
          value = _value[0].value;
        } else if (_value !== undefined) {
          value = _value;
        }
      }
    } catch (error) {
      console.error('error in extract InfoFrom Script', error);
    }
  }
  return value;
};

export const extractRegexFromString = (str: string, regex: RegExp) => {
  const match = str.match(regex);
  if (match) {
    return match[0];
  } else {
    return null;
  }
};

export const findProductInfo = (
  $: CheerioAPI,
  shop: ShopObject,
  url: string,
  extractLinks: boolean = true,
): Candidate => {
  const regexp = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2,4})/g;
  const regex = /[^A-Za-z0-9\s,.öäÖÄüÜ\-]/g;
  const pznRegex = /\b[0-9]{7}\b|\b[0-9]{8}\b/;
  const eanRegex = /\b[0-9]{12}\b|\b[0-9]{13}\b/;
  const urlRegex =
    /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/gm;
  let p = '';
  let n = '';
  let a: string | undefined;
  let pzn = '';
  let ean = '';
  let m = '';
  let sku = '';
  let mku = '';
  let ps = '';
  let img: string[] = [];
  let f = '';
  let ls: string[] = [];

  if (shop?.img !== undefined) {
    img = imageLinks($, shop.img, urlRegex, shop.imgMeta);
  }

  //feature
  if (shop?.f !== undefined) {
    const fResult = extractFromVariousLocations($, shop.f);
    if (fResult) {
      f = fResult;
    }
  }
  //price
  if (shop.p !== undefined && shop.p.length === 0) {
    shop.p.map((selector) => {
      const pResult = extractFromVariousLocations($, selector, regexp);
      if (pResult) {
        p = pResult.toString();
      }
    });
  }
  //name
  if (shop.n !== undefined) {
    const nResult = extractFromVariousLocations($, shop.n);
    if (nResult) {
      n = nResult;
    }
  }
  //availability
  if (shop.a !== undefined) {
    const aResult = extractFromVariousLocations($, shop.a);
    if (aResult) {
      a = deliveryTime(aResult);
    }
  }
  //manufactuerer
  if (shop.m !== undefined) {
    const mResult = extractFromVariousLocations($, shop.m);
    if (mResult) {
      m = mResult;
    }
  }
  //package size
  if (shop.ps !== undefined) {
    const psResult = extractFromVariousLocations($, shop.ps);
    if (psResult) {
      ps = psResult;
    }
  }

  //ean
  if (shop.ean !== undefined) {
    const eanResult = extractFromVariousLocations($, shop.ean, eanRegex);
    if (eanResult) {
      ean = eanResult;
    }
  }
  //sku
  if (shop.sku !== undefined) {
    const skuResult = extractFromVariousLocations($, shop.sku, eanRegex);
    if (skuResult) {
      sku = skuResult;
    }
  }
  //mku
  if (shop.mku !== undefined) {
    const skuResult = extractFromVariousLocations($, shop.mku, eanRegex);
    if (skuResult) {
      mku = skuResult;
    }
  }
  //pzn
  if (shop.pzn !== undefined) {
    const pznResult = extractFromVariousLocations($, shop.pzn, pznRegex);
    if (pznResult) {
      pzn = pznResult;
    }
  }

  if (a === undefined) {
    a = '';
  }
  if (m !== '') {
    m = m
      .replace(regex, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\banbieter/gi, '')
      .replace(/\bhersteller/gi, '')
      .trim();
  }
  //collect all internal links of the page
  ls = extractLinks ? collectInternalLinks($, shop, url) : [];

  return {
    l: '',
    sku,
    mku,
    ean,
    pzn: pzn !== '' ? pzn.padStart(8, '0') : '',
    a: a.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    n: n.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    p: p.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    m,
    img,
    f,
    ps: ps.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    ls,
  };
};

export function isCandidate(
  candidate: Candidate | FailedPage | undefined,
): candidate is Candidate {
  return (candidate as Candidate).l !== undefined;
}

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const maxPZNCount = (ctn: string): { pzn: string; cnt: number } => {
  let res = { pzn: '', cnt: 0 };
  const pznPattern = /\b[0-9]{7}\b|\b[0-9]{8}\b/g;
  const arr = [...ctn.matchAll(pznPattern)];
  arr.reduce((acc: any, match: any) => {
    const _match = match[0];
    if (acc[_match] !== undefined) {
      acc[_match] = acc[_match] + 1;
      if (acc[_match] > res.cnt) res = { pzn: _match, cnt: acc[_match] };
    } else {
      acc[_match] = 1;
    }
    return acc;
  }, {});
  return res;
};

export const getCheerioAPI = async (
  _url: string,
): Promise<CheerioAPI | undefined> => {
  const proxy = _.sample(proxies);
  const userAgent = _.sample(userAgentList);
  try {
    if (proxy && userAgent) {
      const myURL = new URL('http://' + proxy);
      const options = url.urlToHttpOptions(myURL);
      const proxyAgent = new HttpsProxyAgent(options as string);
      const res = await fetch(_url, { agent: proxyAgent });
      const body = await res.text();
      if (body !== '') return load(body);
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const searchProductWithPZN = async (
  _url: string,
  passwordAuth: boolean = false,
): Promise<SearchProductWithPZNResponse> => {
  const proxy = _.sample(proxies);
  const _proxy = passwordAuth ? 'resi.proxyscrape.com:8000' : proxy!;
  try {
    const timeout = 20000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const userAgent = _.sample(userAgentList);
    if (proxy && userAgent) {
      const myURL = new URL('http://' + _proxy);
      const options = url.urlToHttpOptions(myURL);
      if (passwordAuth) options.auth = '23oj7wi7uj:89x51dmfs0-country-DE';
      const proxyAgent = new HttpsProxyAgent(options as string);
      const res = await fetch(_url, {
        agent: proxyAgent,
        method: 'HEAD',
        headers: { 'User-Agent': userAgent.agent },
        //@ts-ignore
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        return { url: res.url, err: false, status: 200 };
      } else {
        return { url: res.url, status: res.status, err: false };
      }
    } else {
      return { url: _url, err: true, status: 0 };
    }
  } catch (error) {
    console.log('error:', error);
    return { url: _url, err: true, status: 0 };
  }
};

export const getImageWithFetch = async (_url: string, proxyAuth: ProxyAuth) => {
  const myProxyURL = new URL('http://' + proxyAuth.host);
  const options = url.urlToHttpOptions(myProxyURL);
  options.auth = `${proxyAuth.username}:${proxyAuth.password}`;
  let userAgent = _.sample(userAgentList);
  if (userAgent === undefined) userAgent = userAgentList[0];

  const proxyAgent = new HttpsProxyAgent(options);
  const res = await fetch(_url, {
    agent: proxyAgent,
    headers: { 'User-Agent': userAgent.agent },
  });
  if (res.ok) {
    return { buffer: await res.arrayBuffer(), type: mime.lookup(_url) };
  } else {
    return false;
  }
};

export const getProductInfoWithBrowser = async (
  url: string,
  shop: ShopObject,
  browserInfo: BrowserInfo,
  extractLinks: boolean = true,
  proxyAuth: ProxyAuth,
): Promise<ProductInfoRequestResponse> => {
  let newCandidate: Candidate = {
    a: '',
    p: '',
    ean: '',
    n: '',
    l: '',
    m: '',
    img: [],
    f: '',
    ps: '',
    pzn: '',
    ls: [],
    mku: '',
    sku: '',
  };
  const { exceptions, resourceTypes, waitUntil } = shop;
  const page = await getPage({
    browser: browserInfo.brs,
    shop,
    requestCount: 0,
    disAllowedResourceTypes: shop.resourceTypes['query'],
    exceptions,
  });

  try {
    await page.goto(url, {
      waitUntil: shop?.waitUntil ? shop.waitUntil.entryPoint : 'networkidle2',
      timeout: 60000,
    });

    if (shop?.actions) {
      for (const action of shop.actions) {
        const selector = await page
          .waitForSelector(action.sel, {
            visible: true,
            timeout: 5000,
          })
          .catch((e) => {
            if (e instanceof TimeoutError) {
              return 'missing';
            }
          });
        if (selector === 'missing') {
          continue;
        }
        const isClickable = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return (
            element &&
            element.getBoundingClientRect().width > 0 &&
            element.getBoundingClientRect().height > 0
          );
        }, action.sel);

        await page.hover(action.sel);

        if (isClickable) {
          await page.click(action.sel).catch((e) => e.message);
        } else {
          await page
            .evaluate((selector) => {
              const element = document.querySelector(
                selector,
              ) as HTMLAnchorElement;
              if (element !== null) {
                element.click();
              }
            }, action.sel)
            .catch((e) => e.message);
        }
        if ('target' in action && typeof action.target === 'string') {
          const selector = await page
            .waitForSelector(action.target, {
              visible: true,
              timeout: 5000,
            })
            .catch((e) => {
              if (e instanceof TimeoutError) {
                return 'missing';
              }
            });
          if (selector === 'missing') {
            continue;
          }
        }
      }
    }
    const html = await page.content();

    page.on('error', async (event: any) => {
      console.error('error', event);
      await closePage(page);
      return { err: true, url, newCandidate };
    });
    page.on('response', (request) => {
      console.error(request);
    });
    newCandidate = findProductInfo(load(html), shop, url, extractLinks);
    newCandidate.l = url;
    await closePage(page);
    return { newCandidate, err: false, url };
  } catch (error: any) {
    console.error('catch error getProductInfoWithBrowser', error.message);
    await closePage(page);
    return { url, err: true, newCandidate };
  }
};
