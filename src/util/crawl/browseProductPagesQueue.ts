import { Page } from 'puppeteer1';
import {
  clickBtn,
  deleteElementFromPage,
  extractAttributePage,
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
import { buildNextPageUrl } from './buildNextPageUrl';
import { calculatePageCount } from './calculatePageCount';

export async function browseProductPagesQueue(
  page: Page,
  request: CrawlerRequest,
) {
  const { shop, limit, addProduct, pageInfo, query, queue, productCount } =
    request;
  const { pages } = limit;

  const timeouts: NodeJS.Timeout[] = [];
  const { paginationEl: paginationEls, waitUntil, crawlActions } = shop;

  if (crawlActions && crawlActions.length > 0) {
    for (let i = 0; i < crawlActions.length; i++) {
      const action = crawlActions[i];
      const { interval, action: subAction, type, sel, wait } = action;
      if (type === 'element' && subAction === 'delete' && interval) {
        timeouts.push(
          setInterval(
            async () => await deleteElementFromPage(page, sel),
            interval as number,
          ),
        );
      }
      if (type === 'scroll') {
        await humanScroll(page);
      }
      if (type === 'button' && wait && subAction && sel) {
        if (subAction === 'waitBefore') {
          await new Promise((r) => setTimeout(r, 600));
        }
        await clickBtn(
          page,
          sel,
          wait ?? false,
          waitUntil,
          'waitDuration' in action ? action.waitDuration : undefined,
        );
      }
    }
  }

  let { pagination, paginationEl } = await findPagination(
    page,
    paginationEls,
    limit,
  );

  if (pagination) {
    const { type, sel, wait, initialUrl } = paginationEl;
    if (type === 'pagination') {
      let initialPageUrl = page.url();
      if (initialUrl) {
        const urlObject = new URL(initialPageUrl);
        const content = await page.content().catch((e) => {});
        if (content) {
          const regexp = new RegExp(initialUrl.regexp, 'g');
          if (regexp.test(content)) {
            const match = content.match(regexp);
            if (match) {
              if (initialUrl.type === 'encoded') {
                const pathname = decodeURIComponent(
                  match[0].replace(/\\u002F/g, '/'),
                );
                initialPageUrl = urlObject.origin + pathname;
              }
            }
          }
        }
      }

      const pageCount = await getPageNumberFromPagination(
        page,
        shop,
        paginationEl,
        1,
        productCount,
      );

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
        const noOfPages = calculatePageCount(limit, pageCount);
        switch (true) {
          case pageCount === 0:
            request.productPageCountHeuristic['0'] += 1;
            break;
          case pageCount >= 0 && pageCount < 10:
            request.productPageCountHeuristic['1-9'] += 1;
            break;
          case pageCount >= 10 && pageCount < 50:
            request.productPageCountHeuristic['10-49'] += 1;
            break;
          case pageCount >= 50:
            request.productPageCountHeuristic['+50'] += 1;
            break;
        }

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;
          if (i === 0) {
            await crawlProducts(
              page,
              shop,
              addProduct,
              pageInfo,
              pageNo,
            ).finally(() => {
              timeouts.forEach((timeout) => clearInterval(timeout));
              closePage(page).then();
            });
          } else {
            let nextUrl = buildNextPageUrl(
              initialPageUrl,
              paginationEl.nav,
              pageNo,
            );
            if (paginationEl?.paginationUrlSchema) {
              nextUrl = await paginationUrlBuilder(
                initialPageUrl,
                paginationEls,
                pageNo,
                page,
                query?.product.value,
              );
            }
            process.env.DEBUG === 'true' &&
              console.log(initialPageUrl, 'nextUrl:', nextUrl);

            queue.pushTask(crawlProductsQueue, {
              ...request,
              retries: 0,
              initialProductPageUrl: initialPageUrl,
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
        await crawlProducts(page, shop, addProduct, pageInfo, 1).finally(() => {
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
      await crawlProducts(page, shop, addProduct, pageInfo, 1).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    } else if (type === 'scroll-and-click') {
      let exists = true;
      let cnt = 0;
      while (exists && cnt < limit.pages - 1) {
        cnt++;
        await humanScroll(page);
        const btn = await waitForSelector(page, sel, 500, true);
        if (btn) {
          await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
        }
      }
      await crawlProducts(page, shop, addProduct, pageInfo, 1).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
      return 'crawled';
    }
  } else {
    await crawlProducts(page, shop, addProduct, pageInfo, 1).finally(() => {
      timeouts.forEach((timeout) => clearInterval(timeout));
      closePage(page).then();
    });
    return 'crawled';
  }
}
