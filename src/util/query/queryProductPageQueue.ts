import { Page } from 'rebrowser-puppeteer';
import { closePage } from '../browser/closePage';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';
import { runActions } from './runActions';
import { getInnerText } from '../helpers';

export async function queryProductPageQueue(page: Page, request: QueryRequest) {
  const { addProductInfo, shop } = request;
  const rawProductInfos: { key: string; value: string }[] = [];
  const { product } = shop;

  // // slow done
  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  if (shop?.crawlActions && shop.crawlActions.length) {
    await runActions(page, shop, 'crawl');
  }

  if (shop?.pageErrors && shop.pageErrors.length) {
    shop.pageErrors.forEach(async (error) => {
      const text = await getInnerText(page, error.sel);
      if (text && text.includes(error.text)) {
        closePage(page);
        throw new Error(error.errorType);
      }
    });
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
    if (addProductInfo)
      await addProductInfo({ productInfo: rawProductInfos, url });
    await closePage(page);
  } else {
    if (addProductInfo) await addProductInfo({ productInfo: null, url });
    await closePage(page);
  }
}
