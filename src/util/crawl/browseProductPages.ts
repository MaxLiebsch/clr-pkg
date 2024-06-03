import { Page } from 'puppeteer1';
import { Limit, ShopObject } from '../../types';
import {
  clickBtn,
  deleteElementFromPage,
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

export async function browseProductpages(
  page: Page,
  shop: ShopObject,
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
  const limitPages = limit?.pages ? limit?.pages : 1;

  if (shop.crawlActions && shop.crawlActions.length > 0) {
    for (let i = 0; i < shop.crawlActions.length; i++) {
      const action = shop.crawlActions[i];
      if (
        action.type === 'element' &&
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
    }
  }

  if (pagination && limitPages > 0) {
    const { type, sel, wait } = paginationEl;

    if (type === 'pagination') {
      const initialpageurl = page.url();

      const { noOfFoundPages } = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
      );
      process.env.DEBUG && console.log('noOfFoundPages:', noOfFoundPages)

      if (noOfFoundPages) {
        const noOfPages = limitPages
          ? limitPages > noOfFoundPages
            ? noOfFoundPages
            : limitPages
          : noOfFoundPages;

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;

          if (i === 0) {
            await crawlProducts(page, shop, addProductCb, pageInfo);
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
            process.env.DEBUG && console.log('nextUrl:', nextUrl)

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
        await crawlProducts(page, shop, addProductCb, pageInfo);
        return 'crawled';
      }
    } else if (type === 'recursive-more-button') {
      let exists = true;
      let cnt = 0;
      while (exists && cnt <= limitPages) {
        cnt++;
        const btn = await waitForSelector(page, sel, undefined, true);
        if (btn) {
          await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
        } else {
          exists = false;
        }
      }
      await crawlProducts(
        page,
        shop,
        addProductCb,
        pageInfo,
      ).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
    }
  } else {
    await crawlProducts(page, shop, addProductCb, pageInfo);
    return 'crawled';
  }
}
