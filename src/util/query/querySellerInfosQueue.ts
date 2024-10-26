import { Page } from 'rebrowser-puppeteer';
import { QueryRequest } from '../../types/query-request';
import { PageParser } from '../extract/productDetailPageParser.gateway';
import { runActions } from './runActions';
import { extractAttributePage } from '../helpers';
import {
  MAX_RETRIES_LOOKUP_INFO,
  aznNoFittingText,
  aznNotFoundText,
  aznSizeText,
  aznUnexpectedErrorText,
} from '../../constants';
import { closePage } from '../browser/closePage';
import { ErrorType } from '../../util.services/queue/ErrorTypes';
import { safeParsePrice } from '../safeParsePrice';
import { sleep } from '../extract';

function timeoutPromise(timeout: number) {
  let timeoutId: NodeJS.Timeout | undefined = undefined;
  let resolved = false;
  let earlyResolve: () => void = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!resolved) {
        reject(new Error(ErrorType.AznTimeout));
      }
    }, timeout);

    // Store the resolve function to call it later if needed
    earlyResolve = () => {
      if (!resolved) {
        resolved = true;
        resolve();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
  });
  return { promise, timeoutId, earlyResolve };
}

async function querySellerInfos(page: Page, request: QueryRequest) {
  const startTime = Date.now();
  const {
    addProductInfo,
    shop,
    query,
    lookupRetryLimit,
    onNotFound,
    retries,
    targetShop,
  } = request;

  const RETRY_LIMIT =
    typeof lookupRetryLimit === 'number'
      ? lookupRetryLimit
      : MAX_RETRIES_LOOKUP_INFO;

  const targetShopId = targetShop?.name;
  const { value: ean } = query.product;
  const rawProductInfos: { key: string; value: string }[] = [];
  const { product } = shop;

  if (shop.queryActions && shop.queryActions.length) {
    await runActions(page, shop, 'query', query, 1);
  }

  const unexpectedError = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );

  if (unexpectedError && unexpectedError.includes(aznUnexpectedErrorText)) {
    if (retries < RETRY_LIMIT) {
      throw new Error(ErrorType.AznUnexpectedError);
    } else {
      onNotFound && (await onNotFound('notFound'));
    }
    await closePage(page);
    return;
  }

  const notFound = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );

  if (
    notFound &&
    (notFound.includes(aznNotFoundText) ||
      notFound.includes(aznNoFittingText) ||
      notFound.includes(aznSizeText))
  ) {
    if (retries < RETRY_LIMIT) {
      throw new Error(ErrorType.AznNotFound);
    } else {
      onNotFound && (await onNotFound('notFound'));
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

  const price = rawProductInfos.find((info) => info.key === 'a_prc');
  if (price) {
    const parsedPrice = safeParsePrice(price.value);

    if (parsedPrice) {
      if (parsedPrice <= 1) {
        await runActions(page, shop, 'query', query, 1.2);
        await sleep(1700);
        const filteredProducts = product.filter(
          (detail) => detail.step === 1.2,
        );
        const pageParser = new PageParser(shop.d, []);
        filteredProducts.forEach((detail: any) => {
          pageParser.registerDetailExtractor(detail.type, detail);
        });
        const details = await pageParser.parse(page);
        Object.entries(details).map(([key, value]) => {
          rawProductInfos.push({ key, value });
        });
      }
    }
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
    if (retries < RETRY_LIMIT) {
      throw new Error(ErrorType.AznProductInfoEmpty); //Retry logic
    } else {
      onNotFound && (await onNotFound('notFound'));
    }
  }
  const endTime = Date.now();
  const elapsedTime = Math.round((endTime - startTime) / 1000);

  return `${targetShopId} - ${ean} took: ${elapsedTime} s`;
}

export async function querySellerInfosQueue(page: Page, request: QueryRequest) {
  const { retries, onNotFound, s_hash, lookupRetryLimit } = request;
  if ('resolveTimeout' in request) {
    request?.resolveTimeout && request.resolveTimeout();
  }
  const RETRY_LIMIT =
    typeof lookupRetryLimit === 'number'
      ? lookupRetryLimit
      : MAX_RETRIES_LOOKUP_INFO;

  if (retries >= RETRY_LIMIT) {
    await closePage(page);
    onNotFound && (await onNotFound('notFound'));
    const message = `Retries exceeded: ${s_hash}`;
    return message;
  }

  const timeoutTime = Math.random() * (25000 - 20000) + 20000;
  const { promise, earlyResolve } = timeoutPromise(timeoutTime);
  request.resolveTimeout = earlyResolve;
  const res = await Promise.race([querySellerInfos(page, request), promise]);
  earlyResolve();
  return res;
}
