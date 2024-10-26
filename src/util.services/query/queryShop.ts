import { Page } from 'rebrowser-puppeteer';
import { ProductRecord } from '../../types/product';
import { ShopObject } from '../../types';
import { Query } from '../../types/query';
import { browseProductPages } from '../../util/crawl/browseProductPages';
import { submitQuery } from './submitQuery';
import { closePage } from '../../util/browser/closePage';

export const queryShop = async (
  page: Page,
  shop: ShopObject,
  query: Query,
  entryPoint: string,
) => {
  const { queryActions, waitUntil } = shop;

  await page
    .goto(entryPoint, {
      waitUntil: waitUntil ? waitUntil.entryPoint : 'networkidle2',
    })
    .catch((e) => {
      closePage(page).then();
    });

  const products: ProductRecord[] = [];

  const addProduct = async (product: ProductRecord) => {
    products.push(product);
  };

  //Query products
  await submitQuery(page, queryActions || [], waitUntil, query);

  const res = await browseProductPages(
    page,
    shop,
    addProduct,
    { link: entryPoint, name: '' },
    undefined,
    query,
  );
  if (res === 'crawled' && !page.isClosed()) {
    await closePage(page);
  }

  return products;
};
