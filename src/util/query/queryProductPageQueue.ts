import { Page } from 'puppeteer1';
import { closePage } from '../browser/closePage';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';

export async function queryProductPageQueue(page: Page, request: QueryRequest) {
  const { addProductInfo, shop } = request;
  const rawProductInfos: { key: string; value: string }[] = [];
  const { product } = shop;
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

  // // slow done
  // const pause = Math.floor(Math.random() * 3000) + 1500;
  // await new Promise((r) => setTimeout(r, pause));

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
