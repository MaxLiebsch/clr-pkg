import { ElementHandle, Page, TimeoutError } from 'puppeteer';
import { Content, Limit, ShopObject } from '../types';
import {
  getElementHandleInnerText,
  getInnerText,
  myQuerySelectorAll,
  scrollToBottom,
  waitForSelector,
} from './helpers';
import { crawlProducts } from './crawlProducts';
import { ProductRecord } from '../types/product';
import { paginationUrlBuilder } from './paginationURLBuilder';
import { Query } from '../types/query';
import { ICategory } from './getCategories';
import { StatService, SubCategory } from './fs/stats';
import { checkForBlockingSignals } from '../checkPageHealth';
import { closePage } from './closePage';

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
  let pagination: ElementHandle<Element> | 'missing' | null | undefined;
  let paginationEl = paginationEls[0];
  let pages: number[] = [];

  for (let index = 0; index < paginationEls.length; index++) {
    paginationEl = paginationEls[index];
    const { sel } = paginationEl;

    pagination = sel ? await waitForSelector(page, sel) : 'missing';

    if (pagination !== 'missing' && pagination) break;
  }

  if (pagination !== 'missing' && pagination) {
    const { calculation, type } = paginationEl;

    if (type === 'pagination') {
      const initialpageurl = page.url();
      if (calculation) {
        if (calculation.method === 'button') {
          const pageButtons = await myQuerySelectorAll(page, calculation.sel);
          if (pageButtons !== 'missing' && pageButtons) {
            pages = new Array(pageButtons.length);
          }
        }
        if (calculation.method === 'first_last') {
          const last = await getInnerText(page, calculation.last);
          if (last) {
            pages = new Array(parseInt(last));
          } else {
            const next = await getInnerText(page, calculation.sel);
            if (next) {
              pages = new Array(parseInt(next));
            }
          }
        }
        if (calculation.method === 'count') {
          const paginationEls = await page.$$(calculation.sel).catch((e) => {
            if (e instanceof TimeoutError) {
              return 'missing';
            }
          });
          if (paginationEls !== 'missing' && paginationEls) {
            let pagesCount = 0;
            for (let index = 0; index < paginationEls.length; index++) {
              const paginationEl = paginationEls[index];
              const innerText = await getElementHandleInnerText(paginationEl);
              if (innerText) {
                const parsedNumber = parseInt(innerText);
                if (parsedNumber && parsedNumber > pagesCount) {
                  pagesCount = parsedNumber;
                }
              }
            }
            pages = new Array(pagesCount);
          }
        }
      }

      const noOfFoundPages = pages?.length ?? 0;

      if (noOfFoundPages) {
        if (scanShop) {
          category['cnt_pages'] = pages.length;
        }
        const limitPages = limit?.pages ? limit?.pages : 0;
        
        const noOfPages = limitPages
          ? limitPages > noOfFoundPages
            ? noOfFoundPages
            : limitPages
          : noOfFoundPages;

        for (let i = 0; i < noOfPages; i++) {
          const pageNo = i + 1;
          console.log(`Page ${pageNo} of ${noOfPages} Pages`);
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
            const blocked = await checkForBlockingSignals(page, shop.mimic);
            //TODO: Endless loop!
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
