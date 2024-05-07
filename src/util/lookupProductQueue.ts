import { Page, TimeoutError } from 'puppeteer';
import {
  getElementHandleInnerText,
  getInnerText,
  waitForSelector,
} from './helpers';
import { closePage } from './closePage';
import { getPrice } from './compare_helper';
import parsePrice from 'parse-price';
import { QueryRequest } from '../types/query-request';
import { PageParser } from './extract/productDetailPageParser.gateway';

export async function lookupProductQueue(page: Page, request: QueryRequest) {
  const { addProductInfo, shop } = request;

  const bsrRegex =
    /Nr\. (\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})|\d+) in (.+?)(?= \(|$)/g;

  function splitNumberAndCategory(input: string) {
    const matches = input.matchAll(bsrRegex);
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

  const productDetails =[{
    content: 'a_img',
    type: 'src',
    parent: '#imgTagWrapperId',
    sel: 'img',
  },
  {
    type: 'text',
    parent: '#corePrice_feature_div',
    sel: 'span.a-offscreen',
    content: 'a_prc',
  }]

  const productInfos: any[] = [
    {
      sel: '#detailBulletsWrapper_feature_div',
      type: 'list',
      timeout: 1000,
      listItem: '#detailBulletsWrapper_feature_div li span.a-list-item',
      seperator: ':',
      productDetails
    },
    {
      sel: '#productDetails_db_sections',
      timeout: 1000,
      type: 'table',
      th: '#productDetails_db_sections tbody th.prodDetSectionEntry',
      td: '#productDetails_db_sections tbody td',
      productDetails
    },
  ];
  const rawProductInfos: { key: string; value: string }[] = [];

  
  for (let index = 0; index < productInfos.length; index++) {
    const productInfo = productInfos[index];
    const { sel, timeout, type, productDetails } = productInfo;
    const selector = await waitForSelector(page, sel, timeout ?? 5000, false);
    //slow server
    const pause = Math.floor(Math.random() * 1500) + 1000;
    await new Promise((r) => setTimeout(r, pause));
    if (selector !== 'missing' && selector) {
      if (type === 'table' && 'th' in productInfo && 'td' in productInfo) {
        const { th, td } = productInfo;
        const keyHandles = await page.$$(th).catch((e) => {
          if (e instanceof TimeoutError) {
            return 'missing';
          }
        });
        const valueHandles = await page.$$(td).catch((e) => {
          if (e instanceof TimeoutError) {
            return 'missing';
          }
        });

        if (
          keyHandles !== 'missing' &&
          keyHandles &&
          valueHandles &&
          valueHandles !== 'missing'
        ) {
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
      }

      if (
        type === 'list' &&
        'listItem' in productInfo &&
        'seperator' in productInfo
      ) {
        const { listItem, seperator } = productInfo;
        const listItemHandles = await page.$$(listItem).catch((e) => {
          if (e instanceof TimeoutError) {
            return 'missing';
          }
        });
        if (listItemHandles && listItemHandles !== 'missing') {
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
      if (productDetails) {
        const pageParser = new PageParser(shop.d, []);
        productDetails.forEach((detail: any) => {
          pageParser.registerDetailExtractor(detail.type, detail);
        });
        const details = await pageParser.parse(page);
        Object.entries(details).map(([key, value]) => {
          rawProductInfos.push({ key, value });
        });
      }
    }
  }
  if (rawProductInfos.length) {
    const cleanedProductInfo = rawProductInfos.map((rawInfo) => {
      const { key, value } = rawInfo;
      if (key.toLowerCase().includes('bestseller')) {
        return { key: 'bsr', value: splitNumberAndCategory(value) };
      }
      if (key === 'a_prc') {
        return { key, value: parsePrice(getPrice(value)) };
      }
      if (key.toLowerCase().includes('asin')) {
        return { key: key.toLowerCase(), value };
      }
      return { key, value };
    });

    if (addProductInfo) addProductInfo(cleanedProductInfo);
  } else {
    if (addProductInfo) addProductInfo(null);
  }
  closePage(page);
}
