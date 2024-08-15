import { Page } from 'puppeteer1';
import {
  clickBtn,
  deleteElementFromPage,
  humanScroll,
  scrollToBottom,
  waitForSelector,
} from '../helpers';
import { paginationUrlBuilder } from '../crawl/paginationURLBuilder';
import { closePage } from '../browser/closePage';
import { crawlProductsQueue } from '../crawl/crawlProductsQueue';
import findPagination from '../crawl/findPagination';
import { getPageNumberFromPagination } from '../crawl/getPageNumberFromPagination';
import { crawlProducts } from '../crawl/crawlProducts';
import { CrawlerRequest } from '../../types/query-request';

export async function browseProductPagesQueue(
  page: Page,
  request: CrawlerRequest,
) {
  const { shop, limit, addProduct, pageInfo, query, queue, productCount } =
    request;

  const timeouts: NodeJS.Timeout[] = [];
  const { paginationEl: paginationEls, waitUntil } = shop;

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
      if (action.type === 'scroll') {
        await humanScroll(page);
      }
    }
  }

  let { pagination, paginationEl } = await findPagination(
    page,
    paginationEls,
    limit,
  );

  if (pagination) {
    const { type, sel, wait } = paginationEl;
    if (type === 'pagination') {
      let initialpageurl = page.url();
      if (paginationEl.initialUrl) {
        const urlObject = new URL(initialpageurl);
        const content = await page.content().catch((e) => {});
        if (content) {
          const regexp = new RegExp(paginationEl.initialUrl.regexp, 'g');
          if (regexp.test(content)) {
            const match = content.match(regexp);
            if (match) {
              if (paginationEl.initialUrl.type === 'encoded') {
                const pathname = decodeURIComponent(
                  match[0].replace(/\\u002F/g, '/'),
                );
                initialpageurl = urlObject.origin + pathname;
              }
            }
          }
        }
      }

      const { noOfFoundPages } = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
        productCount,
      );

      if (noOfFoundPages) {
        const limitPages = limit?.pages ? limit?.pages : 0;

        const noOfPages = limitPages
          ? limitPages > noOfFoundPages
            ? noOfFoundPages
            : limitPages
          : noOfFoundPages;

        switch (true) {
          case noOfFoundPages === 0:
            request.productPageCountHeuristic['0'] += 1;
            break;
          case noOfFoundPages >= 0 && noOfFoundPages < 10:
            request.productPageCountHeuristic['1-9'] += 1;
            break;
          case noOfFoundPages >= 10 && noOfFoundPages < 50:
            request.productPageCountHeuristic['10-49'] += 1;
            break;
          case noOfFoundPages >= 50:
            request.productPageCountHeuristic['+50'] += 1;
            break;
        }

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;
          if (i === 0) {
            await crawlProducts(page, shop, addProduct, pageInfo).finally(
              () => {
                timeouts.forEach((timeout) => clearInterval(timeout));
                closePage(page).then();
              },
            );
          } else {
            if (initialpageurl.includes('?')) {
              if (paginationEl.nav.includes('?')) {
                paginationEl.nav = paginationEl.nav.replace('?', '&');
              }
            }
            let nextUrl = `${initialpageurl}${paginationEl.nav}${pageNo}`;
            if (paginationEl?.paginationUrlSchema) {
              nextUrl = paginationUrlBuilder(
                initialpageurl,
                paginationEls,
                pageNo,
                query?.product.value,
              );
            }
            queue.pushTask(crawlProductsQueue, {
              ...request,
              retries: 0,
              initialProductPageUrl: initialpageurl,
              pageNo,
              paginationType: type,
              noOfPages,
              pageInfo: {
                ...pageInfo,
                link: nextUrl,
              },
            });
          }
          if (i === noOfPages - 1) {
            timeouts.forEach((timeout) => clearInterval(timeout));
            await closePage(page);
          }
        }
      }
    } else if (type === 'infinite_scroll') {
      const scrolling = await scrollToBottom(page);
      if (scrolling === 'finished') {
        await crawlProducts(page, shop, addProduct, pageInfo).finally(() => {
          timeouts.forEach((timeout) => clearInterval(timeout));
          closePage(page).then();
        });
      }
    } else if (type === 'recursive-more-button') {
      let exists = true;
      let cnt = 0;
      while (exists && cnt < limit.pages - 1) {
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
      await crawlProducts(page, shop, addProduct, pageInfo).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
    }
  } else {
    await crawlProducts(page, shop, addProduct, pageInfo).finally(() => {
      timeouts.forEach((timeout) => clearInterval(timeout));
      closePage(page).then();
    });
  }
}
