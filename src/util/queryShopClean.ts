import { Page } from 'puppeteer';
import { Product, ProductRecord } from '../types/product';
import { ShopObject } from '../types';
import { Query } from '../types/query';
import { browseProductpages } from './browseProductPages';
import { submitQuery } from './submitQuery';
import { ICategory } from './getCategories';
import { closePage } from './closePage';

export const queryShopClean = async (
  page: Page,
  request: {
    shop: ShopObject;
    query: Query;
    pageInfo: ICategory;
    addProduct: (product: ProductRecord) => Promise<void>;
    isFinished: () => boolean;
  },
) => {
  const { shop, query, pageInfo, addProduct, isFinished } = request;
  const { queryActions, waitUntil } = shop;

  await submitQuery(page, queryActions, waitUntil, query);
  const res = await browseProductpages(
    page,
    shop,
    addProduct,
    pageInfo,
    undefined,
    undefined,
    query,
  );
  if (res === 'crawled' && !page.isClosed()) {
    await closePage(page);
  }
  isFinished();
};
