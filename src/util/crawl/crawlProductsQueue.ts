import { Page } from 'rebrowser-puppeteer';
import findPagination from './findPagination';
import { getPageNumberFromPagination } from './getPageNumberFromPagination';
import { paginationUrlSchemaBuilder } from './paginationURLBuilder';
import { closePage } from '../browser/closePage';
import { crawlProducts } from '../crawl/crawlProducts';
import { ScrapeRequest } from '../../types/query-request';
import { myQuerySelectorAll } from '../helpers';
import { buildNextPageUrl } from './buildNextPageUrl';
import { calculatePageCount } from './calculatePageCount';

export const crawlProductsQueue = async (
  page: Page,
  request: ScrapeRequest,
) => {
  const {
    shop,
    pageInfo,
    addProduct,
    pageNo,
    noOfPages,
    productCount,
    paginationType,
    limit,
    query,
    initialProductPageUrl,
    queue,
  } = request;
  const { paginationEl: paginationEls } = shop;

  const paginationEl = shop.paginationEl[0];
  const { calculation } = paginationEl;
  const { dynamic } = calculation;
  const lastPage = pageNo === noOfPages;

  if (
    paginationEl &&
    dynamic &&
    lastPage &&
    paginationType === 'pagination'
  ) {
    let { paginationEl } = await findPagination(page, paginationEls, limit);

    const { productList } = shop;
    let hasProducts = false;

    for (let index = 0; index < productList.length; index++) {
      const { product } = productList[index];
      const productEls = await myQuerySelectorAll(page, product.sel);
      if (productEls) {
        hasProducts = true;
      }
    }
    if (hasProducts) {
      const pageCount = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
        productCount === undefined ? null : productCount,
        noOfPages,
      );
      if (pageCount && pageNo && initialProductPageUrl) {
        const noOfPages = calculatePageCount(limit, pageCount);
        for (let i = pageNo; i < noOfPages; i++) {
          const pageNo = i + 1;
          let nextUrl = buildNextPageUrl(
            initialProductPageUrl,
            paginationEl.nav,
            pageNo,
          );
          if (paginationEl?.paginationUrlSchema) {
            nextUrl = await paginationUrlSchemaBuilder(
              initialProductPageUrl,
              paginationEls,
              pageNo,
              query?.product.value,
            );
          }
          queue.pushTask(crawlProductsQueue, {
            ...request,
            retries: 0,
            pageNo,
            noOfPages,
            productPagePath: undefined,
            pageInfo: {
              ...pageInfo,
              link: nextUrl,
            },
          });
        }
      }
    }
  }
  await crawlProducts(page, shop, addProduct, pageInfo, pageNo || 1);
  await closePage(page);
};
