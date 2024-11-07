import { Page } from 'rebrowser-puppeteer';
import {
  AddProductInfo,
  AddProductInfoFn,
  LookupInfoCause,
  NotFoundCause,
  OnNotFound,
  QueryRequest,
} from '../../types/query-request';
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
import { handleProductInfo } from './handleProductInfo';

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
  const { addProductInfo, shop, query, lookupRetryLimit, onNotFound, retries } =
    request;

  let lookupInfoCause: LookupInfoCause | undefined = undefined;

  const RETRY_LIMIT =
    typeof lookupRetryLimit === 'number'
      ? lookupRetryLimit
      : MAX_RETRIES_LOOKUP_INFO;

  const { value: ean } = query.product;
  const rawProductInfos: AddProductInfo[] = [];
  const { product } = shop;

  if (shop.queryActions && shop.queryActions.length) {
    await runActions(page, shop, 'query', query, 1);
  }

  const notFound = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );

  if (
    notFound &&
    (notFound.includes(aznNotFoundText) || notFound.includes(aznNoFittingText))
  ) {
    if (retries < RETRY_LIMIT) {
      throw new Error(ErrorType.AznNotFound);
    }
  }

  //  slow done
  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  if (product) {
    const filteredProducts = product.filter((detail) => detail.step === 0);
    const pageParser = new PageParser(shop.d, []);
    filteredProducts.forEach((detail: any) => {
      pageParser.registerDetailExtractor(detail.type, detail);
    });
    const details = await pageParser.parse(page);
    Object.entries(details).map(([key, value]) => {
      rawProductInfos.push({ key, value });
    });
    request.productInfo = rawProductInfos;
  }

  const unexpectedError = await extractAttributePage(
    page,
    'kat-alert[variant=warning]',
    'description',
  );

  if (
    unexpectedError &&
    (unexpectedError.includes(aznUnexpectedErrorText) ||
      unexpectedError.includes(aznSizeText))
  ) {
    lookupInfoCause = 'incompleteInfo';
    if (retries < RETRY_LIMIT - 1) {
      throw new Error(ErrorType.AznUnexpectedError);
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
    request.productInfo = rawProductInfos;
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
        request.productInfo = rawProductInfos;
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
    request.productInfo = rawProductInfos;
  }

  const url = page.url();
  return await handleProductInfo({
    page,
    productInfo: request.productInfo || [],
    request,
    addProductInfo,
    lookupInfoCause,
    onNotFound,
    url,
    ean,
  });
}

export async function querySellerInfosQueue(page: Page, request: QueryRequest) {
  if ('resolveTimeout' in request) {
    request?.resolveTimeout && request.resolveTimeout();
  }

  const timeoutTime = Math.random() * (25000 - 20000) + 20000;
  const { promise, earlyResolve } = timeoutPromise(timeoutTime);
  request.resolveTimeout = earlyResolve;
  const res = await Promise.race([
    querySellerInfos(page, request).finally(async () => {
      await closePage(page);
    }),
    promise,
  ]);
  earlyResolve();
  return res;
}
