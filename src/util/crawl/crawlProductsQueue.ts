import { Page, TimeoutError } from 'puppeteer1';
import findPagination from './findPagination';
import { getPageNumberFromPagination } from './getPageNumberFromPagination';
import { paginationUrlBuilder } from './paginationURLBuilder';
import { closePage } from '../browser/closePage';
import { crawlProducts } from '../crawl/crawlProducts';
import { CrawlerRequest } from '../../types/query-request';
import { myQuerySelectorAll } from '../helpers';

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
  const { productList, paginationEl: paginationEls } = shop;

  const paginationEl = shop.paginationEl[0];
  const lastPage = pageNo === noOfPages;

  if (
    shop.paginationEl.length &&
    paginationEl.calculation?.dynamic &&
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
      const { noOfFoundPages } = await getPageNumberFromPagination(
        page,
        paginationEl,
        productCount,
      );

      if (noOfFoundPages && pageNo && initialProductPageUrl) {
        const limitPages = limit?.pages ? limit?.pages : 0;

        const noOfPages = limitPages
          ? limitPages > noOfFoundPages
            ? noOfFoundPages
            : limitPages
          : noOfFoundPages;

        for (let i = pageNo; i < noOfPages; i++) {
          const pageNo = i + 1;
          console.log('new pages ', pageNo, ' of ', noOfPages);
          let nextUrl = `${initialProductPageUrl}${paginationEl.nav}${pageNo}`;
          if (paginationEl?.paginationUrlSchema) {
            nextUrl = paginationUrlBuilder(
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
  await crawlProducts(page, shop, pageNo ?? 1, addProduct, pageInfo, undefined);
  await closePage(page);
};
