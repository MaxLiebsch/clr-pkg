import { Page } from 'puppeteer1';
import { Limit, ShopObject } from '../../types';
import {
  clickBtn,
  deleteElementFromPage,
  extractAttributePage,
  humanScroll,
  scrollToBottom,
  waitForSelector,
} from '../helpers';
import { crawlProducts } from '../crawl/crawlProducts';
import { ProductRecord } from '../../types/product';
import { paginationUrlBuilder } from '../crawl/paginationURLBuilder';
import { Query } from '../../types/query';
import { ICategory } from '../crawl/getCategories';
import { checkForBlockingSignals } from '../../util.services/queue/checkForBlockingSignals';
import { closePage } from '../browser/closePage';
import findPagination from '../crawl/findPagination';
import { getPageNumberFromPagination } from '../crawl/getPageNumberFromPagination';
import { buildNextPageUrl } from './buildNextPageUrl';
import { Shop } from '../../types/shop';

export async function browseProductpages(
  page: Page,
  shop: Shop,
  addProductCb: (product: ProductRecord) => Promise<void>,
  pageInfo: ICategory,
  limit: Limit | undefined,
  query?: Query,
) {
  const timeouts: NodeJS.Timeout[] = [];
  const { paginationEl: paginationEls, waitUntil } = shop;

  let { pagination, paginationEl } = await findPagination(
    page,
    paginationEls,
    limit,
  );
  process.env.DEBUG === 'true' && console.log('pagination:', pagination);
  const limitPages = limit?.pages ? limit?.pages : 1;

  if (shop.crawlActions && shop.crawlActions.length > 0) {
    for (let i = 0; i < shop.crawlActions.length; i++) {
      const action = shop.crawlActions[i];
      const { type } = action;
      if (
        type === 'element' &&
        'action' in action &&
        action.action === 'delete' &&
        'interval' in action
      ) {
        timeouts.push(
          setInterval(
            async () => await deleteElementFromPage(page, action.sel),
            action.interval as number,
          ),
        );
      }
      if (type === 'scroll') {
        await humanScroll(page);
      }
    }
  }

  if (pagination && limitPages > 0) {
    const { type, sel, wait } = paginationEl;

    if (type === 'pagination') {
      const initialpageurl = page.url();

      const pageCount = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
      );
      process.env.DEBUG && console.log('pageCount:', pageCount);

      if (pageCount) {
        const findPaginationAppendix = paginationEls.find(
          (el) =>
            el?.paginationUrlSchema?.calculation?.method ===
            'find_pagination_apendix',
        );
        if (findPaginationAppendix) {
          const { calculation } = findPaginationAppendix.paginationUrlSchema!;
          const { sel, type, replace } = calculation;
          if (sel && type && replace) {
            const elementText = await extractAttributePage(page, sel, type);
            if (elementText) {
              calculation.appendix = elementText;
            }
          }
        }
        const noOfPages = limitPages
          ? limitPages > pageCount
            ? pageCount
            : limitPages
          : pageCount;

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;

          if (i === 0) {
            await crawlProducts(page, shop, addProductCb, pageInfo);
          } else {
            let nextUrl = buildNextPageUrl(
              initialpageurl,
              paginationEl.nav,
              pageNo,
            );
            if (paginationEl.paginationUrlSchema) {
              nextUrl = await paginationUrlBuilder(
                initialpageurl,
                paginationEls,
                pageNo,
                page,
                query?.product.value,
              );
            }
            process.env.DEBUG && console.log('nextUrl:', nextUrl);

            await Promise.all([
              page
                .goto(nextUrl, {
                  waitUntil: waitUntil ? waitUntil.product : 'load',
                })
                .catch((e) => {}),
              crawlProducts(page, shop, addProductCb, pageInfo),
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
                crawlProducts(page, shop, addProductCb, pageInfo),
              ]);
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
      // type === 'infinite_scroll'
      const scrolling = await scrollToBottom(page);
      if (scrolling === 'finished') {
        await crawlProducts(page, shop, addProductCb, pageInfo).finally(() => {
          timeouts.forEach((timeout) => clearInterval(timeout));
          closePage(page).then();
        });
        return 'crawled';
      }
    } else if (type === 'recursive-more-button') {
      let exists = true;
      let cnt = 0;
      while (exists && cnt < limitPages - 1) {
        cnt++;
        const btn = await waitForSelector(page, sel, undefined, true);
        if (btn) {
          await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
          const shouldscroll = shop.crawlActions
            ? shop.crawlActions.some((action) => action.type === 'scroll')
            : false;
          if (shouldscroll) {
            await humanScroll(page);
          }
        } else {
          exists = false;
        }
      }
      await crawlProducts(page, shop, addProductCb, pageInfo).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    } else if (type === 'scroll-and-click') {
      let exists = true;
      let cnt = 0;
      while (exists && cnt < limitPages - 1) {
        cnt++;
        await humanScroll(page);
        const btn = await waitForSelector(page, sel, 500, true);
        if (btn) {
          await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
        }
      }
      await crawlProducts(page, shop, addProductCb, pageInfo).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    }
  } else {
    await crawlProducts(page, shop, addProductCb, pageInfo).finally(() => {
      timeouts.forEach((timeout) => clearInterval(timeout));
      closePage(page).then();
    });
    return 'crawled';
  }
}
