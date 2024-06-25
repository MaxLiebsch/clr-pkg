import { Page } from 'puppeteer1';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';
import { runActions } from './runActions';
import { extractAttributePage } from '../helpers';
import { aznNotFoundText, aznUnexpectedErrorText } from '../../constants';
import { closePage } from '../browser/closePage';

export async function querySellerInfosQueue(page: Page, request: QueryRequest) {
  const { addProductInfo, shop, query, onNotFound, queue, retries } = request;
  const rawProductInfos: { key: string; value: string }[] = [];
  const { product } = shop;

  // // slow done
  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  if (shop.queryActions && shop.queryActions.length) {
    await runActions(page, shop, 'query', query, 1);
  }

  const timeout = setInterval(async () => {
    const unexpectedError = await extractAttributePage(
      page,
      'kat-alert[variant=warning]',
      'description',
    );

    if (unexpectedError?.includes(aznUnexpectedErrorText)) {
      clearInterval(timeout);
      if (retries < 5) {
        console.log('retring unexpectedError');
        queue.pushTask(querySellerInfosQueue, {
          ...request,
          retries: request.retries + 1,
        });
        await closePage(page);
        return;
      } else {
        console.log('finally unexpectedError');
        await closePage(page);
        return;
      }
    }
  }, 200);

  const notFound = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );
  if (notFound?.includes(aznNotFoundText)) {
    if (retries <= 1) {
      queue.pushTask(querySellerInfosQueue, {
        ...request,
        retries: request.retries + 1,
      });
      await closePage(page);
      return;
    } else {
      if (onNotFound) {
        await onNotFound();
        await closePage(page);
        return;
      }
    }
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
    if (addProductInfo) await addProductInfo({ productInfo: null, url });
  }
}
