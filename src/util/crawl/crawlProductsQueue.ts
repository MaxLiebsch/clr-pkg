import { Page, TimeoutError } from 'puppeteer1';
import findPagination from './findPagination';
import { getPageNumberFromPagination } from './getPageNumberFromPagination';
import { paginationUrlSchemaBuilder } from './paginationURLBuilder';
import { closePage } from '../browser/closePage';
import { crawlProducts } from '../crawl/crawlProducts';
import { CrawlerRequest } from '../../types/query-request';
import { humanScroll, myQuerySelectorAll } from '../helpers';
import { buildNextPageUrl } from './buildNextPageUrl';
import { calculatePageCount } from './calculatePageCount';

export const crawlProductsQueue = async (
  page: Page,
  request: CrawlerRequest,
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
    paginationEls.length &&
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
        noOfPages,
        productCount,
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
