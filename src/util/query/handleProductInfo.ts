import { Page } from 'rebrowser-puppeteer';
import { closePage } from '../browser/closePage';
import {
  AddProductInfo,
  AddProductInfoFn,
  LookupInfoCause,
  OnNotFound,
  QueryRequest,
} from '../../types/query-request';

export async function handleProductInfo({
  page,
  productInfo,
  request,
  addProductInfo,
  lookupInfoCause,
  onNotFound,
  url,
  ean,
}: {
  page: Page;
  productInfo: AddProductInfo[];
  request: QueryRequest;
  addProductInfo?: AddProductInfoFn;
  onNotFound?: OnNotFound;
  lookupInfoCause?: LookupInfoCause;
  ean: string;
  url: string;
}) {
  if (!productInfo.length) {
    return await handleNotFound(page, request, onNotFound, ean);
  } else {
    const sellerRank = productInfo.find((info) => info.key === 'sellerRank');
    const aznCosts = productInfo.find((info) => info.key === 'costs.azn');
    if (sellerRank && sellerRank.value !== '-' && aznCosts) {
      return await handleCompleteInfo(
        page,
        request,
        addProductInfo,
        productInfo,
        url,
        ean,
      );
    }
    if (sellerRank && sellerRank.value === '-') {
      return await handleMissingSellerRank(
        page,
        request,
        addProductInfo,
        productInfo,
        url,
        ean,
      );
    }
    return await handleIncompleteInfo(
      page,
      request,
      addProductInfo,
      productInfo,
      url,
      ean,
    );
  }
}

async function handleNotFound(
  page: Page,
  request: QueryRequest,
  onNotFound: OnNotFound | undefined,
  ean: string,
) {
  request.resolveTimeout && request.resolveTimeout();
  await closePage(page);
  onNotFound && (await onNotFound('notFound'));
  return `${ean} not found on sc`;
}

async function handleCompleteInfo(
  page: Page,
  request: QueryRequest,
  addProductInfo: AddProductInfoFn | undefined,
  productInfo: AddProductInfo[],
  url: string,
  ean: string,
) {
  request.resolveTimeout && request.resolveTimeout();
  await closePage(page);
  addProductInfo &&
    (await addProductInfo({
      productInfo: productInfo,
      url,
      cause: 'completeInfo',
    }));
  return `${ean} found`;
}

async function handleMissingSellerRank(
  page: Page,
  request: QueryRequest,
  addProductInfo: AddProductInfoFn | undefined,
  productInfo: AddProductInfo[],
  url: string,
  ean: string,
) {
  request.resolveTimeout && request.resolveTimeout();
  await closePage(page);
  addProductInfo &&
    (await addProductInfo({
      productInfo: productInfo,
      url,
      cause: 'missingSellerRank',
    }));
  return `${ean} missingSellerRank`;
}

async function handleIncompleteInfo(
  page: Page,
  request: QueryRequest,
  addProductInfo: AddProductInfoFn | undefined,
  productInfo: AddProductInfo[],
  url: string,
  ean: string,
) {
  request.resolveTimeout && request.resolveTimeout();
  await closePage(page);
  addProductInfo &&
    (await addProductInfo({
      productInfo: productInfo,
      url,
      cause: 'incompleteInfo',
    }));
  return `${ean} incompleteInfo`;
}
