import { Page } from 'puppeteer1';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';
import { runActions } from './runActions';
import { extractAttributePage } from '../helpers';
import {
  MAX_RETRIES_LOOKUP_EAN,
  aznNotFoundText,
  aznUnexpectedErrorText,
} from '../../constants';
import { closePage } from '../browser/closePage';

function timeoutPromise(timeout: number, ean: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      return reject(new Error(`Timeout: ${ean}`));
    }, timeout);
  });
}

async function querySellerInfos(page: Page, request: QueryRequest) {
  const startTime = Date.now();
  const {
    addProductInfo,
    shop,
    query,
    onNotFound,
    queue,
    retries,
    pageInfo,
    targetShop,
  } = request;
  const targetShopId = targetShop?.name;
  const { value: ean } = query.product;
  const rawProductInfos: { key: string; value: string }[] = [];
  const { product } = shop;
  if (retries > MAX_RETRIES_LOOKUP_EAN) {
    await closePage(page);
    onNotFound && (await onNotFound());
    return `Finally missing: ${ean}`;
  }

  if (shop.queryActions && shop.queryActions.length) {
    await runActions(page, shop, 'query', query, 1);
  }

  const unexpectedError = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );

  if (unexpectedError?.includes(aznUnexpectedErrorText)) {
    if (retries <= MAX_RETRIES_LOOKUP_EAN) {
      throw new Error(`${targetShopId} - Unexpected Error: ${ean}`);
    } else {
      onNotFound && (await onNotFound());
    }
    await closePage(page);
    return;
  }

  const notFound = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );
  if (notFound?.includes(aznNotFoundText)) {
    if (retries <= MAX_RETRIES_LOOKUP_EAN) {
      throw new Error(`${targetShopId} - Not found: ${ean}`);
    } else {
      onNotFound && (await onNotFound());
    }
    await closePage(page);
    return;
  }

  //  slow done
  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  if (product) {
    const filteredProducts = product.filter((detail) => detail.step === 1);
    const pageParser = new PageParser(shop.d, []);
    filteredProducts.forEach((detail: any) => {
      pageParser.registerDetailExtractor(detail.type, detail);
    });
    const details = await pageParser.parse(page);
    Object.entries(details).map(([key, value]) => {
      rawProductInfos.push({ key, value });
    });
  }

  //Select winter prices
  if (shop.queryActions && shop.queryActions.length) {
    await runActions(page, shop, 'query', query, 2);
  }

  if (product) {
    const filteredProducts = product.filter((detail) => detail.step === 2);
    const pageParser = new PageParser(shop.d, []);
    filteredProducts.forEach((detail: any) => {
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
  } else {
    throw new Error(`${targetShopId} - Product Info seems empty: ${ean}`); //Retry logic
  }
  const endTime = Date.now();
  const elapsedTime = Math.round((endTime - startTime) / 1000);
  return `${targetShopId} - ${ean} took: ${elapsedTime} s`;
}

export async function querySellerInfosQueue(page: Page, request: QueryRequest) {
  const { query } = request;
  const { value: ean } = query.product;
  const timeoutTime = Math.random() * (25000 - 20000) + 20000;
  const res = await Promise.race([
    querySellerInfos(page, request),
    timeoutPromise(timeoutTime, ean),
  ]);
  return res;
}
