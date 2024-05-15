import { Page } from 'puppeteer1';
import { Limit, ShopObject } from '../../types';
import { scrollToBottom } from '../helpers';
import { crawlProducts } from '../crawl/crawlProducts';
import { ProductRecord } from '../../types/product';
import { paginationUrlBuilder } from '../crawl/paginationURLBuilder';
import { Query } from '../../types/query';
import { ICategory } from '../crawl/getCategories';
import { StatService, SubCategory } from '../fs/stats';
import { checkForBlockingSignals } from '../../util.services/queue/checkPageHealth';
import { closePage } from '../browser/closePage';
import findPagination from '../crawl/findPagination';
import { getPageNumberFromPagination } from '../crawl/getPageNumberFromPagination';
import { LoggerService } from '../logger';

const addPageCountAndPushSubPages = (
  category: SubCategory | null,
  productPagePath: string | undefined,
  pageInfo: ICategory,
) => {
  if (productPagePath && category) {
    category.productpages!.push({
      link: pageInfo.link,
    });
    category['cnt_pages'] = 0;
  }
};

const pushSubPages = (
  category: SubCategory | null,
  productPagePath: string | undefined,
  pageInfo: ICategory,
) => {
  if (productPagePath && category) {
    category.productpages!.push({
      link: pageInfo.link,
      offset: 0,
      cnt: 0,
    });
  }
};

export async function browseProductpages(
  page: Page,
  shop: ShopObject,
  addProductCb: (product: ProductRecord) => Promise<void>,
  pageInfo: ICategory,
  limit: Limit | undefined,
  productPagePath?: string,
  query?: Query,
) {
  const statService = StatService.getSingleton(shop.d);
  let category: SubCategory = {
    link: '',
    productpages: [],
  };

  if (productPagePath) {
    category = statService.get(productPagePath);
  }
  const scanShop = category && productPagePath;
  const { paginationEl: paginationEls, waitUntil } = shop;

  let pages: number[] = [];
  let { pagination, paginationEl } = await findPagination(
    page,
    paginationEls,
    limit,
  );
  const limitPages = limit?.pages ? limit?.pages : 0;

  if (pagination !== 'missing' && pagination && limitPages > 0) {
    const { calculation, type } = paginationEl;

    if (type === 'pagination') {
      const initialpageurl = page.url();

      const { pages, noOfFoundPages } = await getPageNumberFromPagination(
        page,
        paginationEl,
      );

      if (noOfFoundPages) {
        if (scanShop) {
          category['cnt_pages'] = pages.length;
        }

        const noOfPages = limitPages
          ? limitPages > noOfFoundPages
            ? noOfFoundPages
            : limitPages
          : noOfFoundPages;

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;
          LoggerService.getSingleton().logger.info(
            `Page ${pageNo} of ${noOfPages} Pages`,
          );
          if (i === 0) {
            if (scanShop) {
              category.productpages!.push({
                link: pageInfo.link,
                offset: 0,
                cnt: 0,
              });
            }

            await crawlProducts(
              page,
              shop,
              pageNo,
              addProductCb,
              pageInfo,
              scanShop ? productPagePath : undefined,
            );
          } else {
            let nextUrl = `${initialpageurl}${paginationEl.nav}${pageNo}`;
            if (paginationEl.paginationUrlSchema) {
              nextUrl = paginationUrlBuilder(
                initialpageurl,
                paginationEls,
                pageNo,
                query?.product.value,
              );
            }
            if (scanShop) {
              category.productpages!.push({
                link: nextUrl,
              });
            }
            await Promise.all([
              page
                .goto(nextUrl, {
                  waitUntil: waitUntil ? waitUntil.product : 'load',
                })
                .catch((e) => {}),
              crawlProducts(
                page,
                shop,
                pageNo,
                addProductCb,
                pageInfo,
                scanShop ? productPagePath : undefined,
              ),
            ]);
            const blocked = await checkForBlockingSignals(
              page,
              true,
              shop.mimic,
              pageInfo.link,
            );
            if (blocked) {
              await Promise.all([
                page
                  .goto(nextUrl, {
                    waitUntil: waitUntil ? waitUntil.product : 'load',
                  })
                  .catch((e) => {}),
                crawlProducts(
                  page,
                  shop,
                  pageNo,
                  addProductCb,
                  pageInfo,
                  scanShop ? productPagePath : undefined,
                ),
              ]);
            }
          }
          if (i === noOfPages - 1) {
            await closePage(page);
          }
        }
        return 'crawled';
      }
    } else {
      // type === 'infinite_scroll'
      addPageCountAndPushSubPages(category, productPagePath, pageInfo);
      const scrolling = await scrollToBottom(page);
      if (scrolling === 'finished') {
        await crawlProducts(
          page,
          shop,
          1,
          addProductCb,
          pageInfo,
          scanShop ? productPagePath : undefined,
        );
        return 'crawled';
      }
    }
  } else {
    addPageCountAndPushSubPages(category, productPagePath, pageInfo);
    await crawlProducts(
      page,
      shop,
      1,
      addProductCb,
      pageInfo,
      scanShop ? productPagePath : undefined,
    );
    return 'crawled';
  }
  scanShop && statService.set(productPagePath, category);
}
