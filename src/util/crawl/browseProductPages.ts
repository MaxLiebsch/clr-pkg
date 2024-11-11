import { Page } from 'rebrowser-puppeteer';
import { Limit } from '../../types';
import {
  clickBtn,
  deleteElementFromPage,
  extractAttributePage,
  getProductCount,
  humanScroll,
  scrollToBottom,
  waitForSelector,
} from '../helpers';
import { crawlProducts } from '../crawl/crawlProducts';
import { ProductRecord } from '../../types/DbProductRecord';
import { paginationUrlSchemaBuilder } from '../crawl/paginationURLBuilder';
import { Query } from '../../types/query';
import { ICategory } from '../crawl/getCategories';
import { checkForBlockingSignals } from '../../util.services/queue/checkForBlockingSignals';
import { closePage } from '../browser/closePage';
import findPagination from '../crawl/findPagination';
import { getPageNumberFromPagination } from '../crawl/getPageNumberFromPagination';
import { buildNextPageUrl } from './buildNextPageUrl';
import { Shop } from '../../types/shop';
import { findPaginationAppendix } from './findPaginationAppendix';
import { recursiveMoreButtonPgn } from './pagination/recursiveMoreButtonPgn';
import { scrollAndClickPgn } from './pagination/scrollAndClickPgn';
import { infinitSrollPgn } from './pagination/InfinitScrollPgn';

export async function browseProductPages(
  page: Page,
  shop: Shop,
  addProductCb: (product: ProductRecord) => Promise<void>,
  pageInfo: ICategory,
  limit: Limit | undefined,
  query?: Query,
) {
  const timeouts: NodeJS.Timeout[] = [];
  const { paginationEl: paginationEls, waitUntil, crawlActions, productList } = shop;

  let { pagination, paginationEl } = await findPagination(
    page,
    paginationEls,
    limit,
  );
  process.env.DEBUG === 'true' && console.log('pagination:', pagination);
  const limitPages = limit?.pages ? limit?.pages : 1;

  const productCount = await getProductCount(page, productList);

  if (crawlActions && crawlActions.length > 0) {
    for (let i = 0; i < crawlActions.length; i++) {
      const action = crawlActions[i];
      const { action: subAction, type, sel, interval } = action;

      if (type === 'element' && subAction === 'delete' && interval) {
        timeouts.push(
          setInterval(
            async () => await deleteElementFromPage(page, sel),
            interval,
          ),
        );
      }
      if (type === 'scroll') {
        await humanScroll(page);
      }
    }
  }

  if (pagination && limitPages > 0) {
    const { type, sel, wait, visible, endOfPageSel } = paginationEl;

    if (type === 'pagination') {
      const initialpageurl = page.url();

      const pageCount = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
        productCount,
      );
      process.env.DEBUG && console.log('pageCount:', pageCount);

      if (pageCount) {
        await findPaginationAppendix(paginationEls, page)
        const noOfPages = limitPages
          ? limitPages > pageCount
            ? pageCount
            : limitPages
          : pageCount;

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;

          if (i === 0) {
            await crawlProducts(page, shop, addProductCb, pageInfo, pageNo);
          } else {
            let nextUrl = buildNextPageUrl(
              initialpageurl,
              paginationEl.nav,
              pageNo,
            );
            if (paginationEl.paginationUrlSchema) {
              nextUrl = await paginationUrlSchemaBuilder(
                initialpageurl,
                paginationEls,
                pageNo,
                query?.product.value,
              );
            }
            process.env.DEBUG && console.log('nextUrl:', nextUrl);
            await page
              .goto(nextUrl, {
                waitUntil: waitUntil ? waitUntil.product : 'load',
              })
              .catch((e) => {});
            await crawlProducts(page, shop, addProductCb, pageInfo, pageNo);
            const blocked = await checkForBlockingSignals(
              page,
              true,
              shop.mimic,
              pageInfo.link,
            );
            if (blocked) {
              await page
                .goto(nextUrl, {
                  waitUntil: waitUntil ? waitUntil.product : 'load',
                })
                .catch((e) => {});
              await crawlProducts(page, shop, addProductCb, pageInfo, pageNo);
            }
          }
          if (i === noOfPages - 1) {
            timeouts.forEach((timeout) => clearInterval(timeout));
            await closePage(page);
          }
        }
        return 'crawled';
      }
    } else if (type === 'infinite_scroll') {
      const scrolling = await infinitSrollPgn({page}) 
      if (scrolling === 'finished') {
        await crawlProducts(page, shop, addProductCb, pageInfo, 1).finally(
          () => {
            timeouts.forEach((timeout) => clearInterval(timeout));
            closePage(page).then();
          },
        );
        return 'crawled';
      }
    } else if (type === 'recursive-more-button') {
      await recursiveMoreButtonPgn({
        limit: limitPages,
        sel,
        page,
        shop,
        wait,
        visible,
        waitUntil,
      });
      await crawlProducts(page, shop, addProductCb, pageInfo, 1).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    } else if (type === 'scroll-and-click') {
      const pageCount = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
        productCount === undefined ? null : productCount,
        1,
      );
      await scrollAndClickPgn({
        limit: limitPages,
        page,
        sel,
        wait,
        endOfPageSel,
        visible,
        waitUntil,
        pageCount
      });
      await crawlProducts(page, shop, addProductCb, pageInfo, 1).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    }
  } else {
    await crawlProducts(page, shop, addProductCb, pageInfo, 1).finally(() => {
      timeouts.forEach((timeout) => clearInterval(timeout));
      closePage(page).then();
    });
    return 'crawled';
  }
}
