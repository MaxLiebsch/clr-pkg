import { Page } from 'puppeteer';
import { scrollToBottom } from './helpers';
import { paginationUrlBuilder } from './paginationURLBuilder';
import { ICategory } from './getCategories';
import { StatService, SubCategory } from './fs/stats';
import { closePage } from './closePage';
import { CrawlerRequest } from './queue';
import { crawlProductsQueue } from './crawlProductsQueue';
import findPagination from './findPagination';
import { getPageNumberFromPagination } from './getPageNumberFromPagination';
import { crawlProducts } from './crawlProducts';

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

export async function browseProductPagesQueue(
  page: Page,
  request: CrawlerRequest,
) {
  const {
    shop,
    productPagePath,
    limit,
    addProduct,
    pageInfo,
    query,
    queue,
    productCount,
  } = request;
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

  let { pagination, paginationEl } = await findPagination(page, paginationEls);

  if (pagination !== 'missing' && pagination) {
    const { type } = paginationEl;

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

      const { pages, noOfFoundPages } = await getPageNumberFromPagination(
        page,
        paginationEl,
        productCount,
      );

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
              addProduct,
              pageInfo,
              scanShop ? productPagePath : undefined,
            ).finally(() => {
              closePage(page).then();
            });
          } else {
            let nextUrl = `${initialpageurl}${paginationEl.nav}${pageNo}`;
            if (paginationEl?.paginationUrlSchema) {
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
            queue.pushTask(crawlProductsQueue, {
              ...request,
              retries: 0,
              initialProductPageUrl: initialpageurl,
              pageNo,
              paginationType: type,
              noOfPages,
              productPagePath: scanShop ? productPagePath : undefined,
              pageInfo: {
                ...pageInfo,
                link: nextUrl,
              },
            });
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
          addProduct,
          pageInfo,
          scanShop ? productPagePath : undefined,
        ).finally(() => {
          closePage(page).then();
        });
      }
    }
  } else {
    addPageCountAndPushSubPages(category, productPagePath, pageInfo);
    await crawlProducts(
      page,
      shop,
      1,
      addProduct,
      pageInfo,
      scanShop ? productPagePath : undefined,
    ).finally(() => {
      closePage(page).then();
    });
  }
  scanShop && statService.set(productPagePath, category);
}
