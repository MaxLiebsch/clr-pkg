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
import { StatService, SubCategory } from '../fs/stats';
import { checkForBlockingSignals } from '../../util.services/queue/checkForBlockingSignals';
import { closePage } from '../browser/closePage';
import findPagination from '../crawl/findPagination';
import { getPageNumberFromPagination } from '../crawl/getPageNumberFromPagination';

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
        timeouts.push(setInterval(
          async () => await deleteElementFromPage(page, action.sel),
          action.interval as number,
        ));
      }
    }
  }

  if (pagination && limitPages > 0) {
    const { calculation, type, sel, wait } = paginationEl;

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
            timeouts.forEach((timeout) => clearInterval(timeout));
            await closePage(page);
          }
        }
        return 'crawled';
      }
    } else if (type === 'infinite_scroll') {
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
        1,
        addProductCb,
        pageInfo,
        scanShop ? productPagePath : undefined,
      ).finally(() => {
        timeouts.forEach((timeout) => clearInterval(timeout));
        closePage(page).then();
      });
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
