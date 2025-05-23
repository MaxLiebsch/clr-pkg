import { Page } from 'rebrowser-puppeteer';
import {
  getElementHandleInnerText,
  myQuerySelectorAll,
  waitForSelector,
} from '../helpers';
import { closePage } from '../browser/closePage';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';
import { safeParsePrice } from '../safeParsePrice';
 

const de_bsrRegex =
  /Nr\. (\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})|\d+) in (.+?)(?= \(|$)/g;
const en_bsrRegex =
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2,4})?|\d+) in ([A-Za-z&\s]+(?:|$))/g;
const replaceBrackets = /\([^)]+\)/g;

export function splitNumberAndCategory(input: string, lng: 'de' | 'en') {
  let str = input;
  if (lng === 'en') {
    str = input.replaceAll(replaceBrackets, '');
  }
  const matches = str.matchAll(lng === 'de' ? de_bsrRegex : en_bsrRegex);
  const results = [];
  if (matches) {
    for (const match of matches) {
      results.push({
        number: parseInt(match[1].replaceAll(/[,.]/g, '')),
        category: match[2].trim(),
        createdAt: new Date().toISOString(),
      });
    }
    return results;
  } else {
    return null; // Return null if no match is found
  }
}
export async function lookupProductQueue(page: Page, request: QueryRequest) {
  const { addProductInfo, shop } = request;
  const { product } = shop;

  const productInfos: any[] = [
    {
      sel: '#detailBulletsWrapper_feature_div',
      type: 'list',
      timeout: 1500,
      listItem: '#detailBulletsWrapper_feature_div li span.a-list-item',
      seperator: ':',
    },
    {
      sel: '#productDetails_db_sections',
      timeout: 1500,
      type: 'table',
      th: '#productDetails_db_sections tbody th.prodDetSectionEntry',
      td: '#productDetails_db_sections tbody td',
    },
  ];
  const rawProductInfos: { key: string; value: string }[] = [];

  // slow done
  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  for (let index = 0; index < productInfos.length; index++) {
    const productInfo = productInfos[index];
    const { sel, timeout, type } = productInfo;
    const selector = await waitForSelector(page, sel, timeout ?? 5000, false);
    if (selector) {
      if (type === 'table' && 'th' in productInfo && 'td' in productInfo) {
        const { th, td } = productInfo;
        const keyHandles = await myQuerySelectorAll(page, th);
        const valueHandles = await myQuerySelectorAll(page, td);

        if (keyHandles && valueHandles)
          for (let i = 0; i < keyHandles.length; i++) {
            let valueText = '';
            const key = keyHandles[i];
            const keyText = await getElementHandleInnerText(key);
            if (keyText) {
              const innerText = await getElementHandleInnerText(
                valueHandles[i],
              );
              if (innerText) {
                valueText = innerText;
              }
              rawProductInfos.push({
                key: keyText.replaceAll(/\W/g, '').trim(),
                value: valueText.trim(),
              });
            }
          }
      }

      if (
        type === 'list' &&
        'listItem' in productInfo &&
        'seperator' in productInfo
      ) {
        const { listItem, seperator } = productInfo;
        const listItemHandles = await myQuerySelectorAll(page, listItem);

        if (listItemHandles)
          for (let i = 0; i < listItemHandles.length; i++) {
            const listItemHandle = listItemHandles[i];
            const innerText = await getElementHandleInnerText(listItemHandle);
            if (innerText) {
              const split = innerText.split(seperator);
              if (split.length === 2) {
                rawProductInfos.push({
                  key: split[0].replaceAll(/\W/g, '').trim(),
                  value: split[1].trim(),
                });
              }
            }
          }
      }
    }
  }
  if (product) {
    const pageParser = new PageParser(shop.d, []);
    product.forEach((detail: any) => {
      pageParser.registerDetailExtractor(detail.type, detail);
    });
    const details = await pageParser.parse(page);
    Object.entries(details).map(([key, value]) => {
      rawProductInfos.push({ key, value });
    });
  }
  const url = page.url();
  if (rawProductInfos.length) {
    const cleanedProductInfo = rawProductInfos.map((rawInfo) => {
      const { key, value } = rawInfo;
      if (key.includes('Rang') || key.includes('Bestseller')) {
        return { key: 'bsr', value: splitNumberAndCategory(value, 'de') ?? '' };
      }
      if (key.includes('Rank') || key.includes('BestSeller')) {
        return { key: 'bsr', value: splitNumberAndCategory(value, 'en') ?? '' };
      }
      if (key === 'a_prc') {
        return { key, value: safeParsePrice(value) as any };
      }
      if (key.toLowerCase().includes('asin')) {
        return { key: key.toLowerCase(), value: value.replace(/\W/g, '') };
      }
      return { key, value };
    });
    if (addProductInfo)
      addProductInfo({ productInfo: cleanedProductInfo, url });
    await closePage(page);
  } else {
    if (addProductInfo) addProductInfo({ productInfo: null, url });
    await closePage(page);
  }
}
