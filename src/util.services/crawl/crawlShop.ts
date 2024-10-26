import { Page } from 'rebrowser-puppeteer';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import { subPageLoop } from './crawlSubPageLoop';
import { performCrawlAction } from '../../util/crawl/performCrawlaction';
import { closePage } from '../../util/browser/closePage';
import { LoggerService } from '../../util/logger';
import { CrawlerRequest } from '../../types/query-request';

export const crawlShop = async (page: Page, request: CrawlerRequest) => {
  const { shop, limit } = request;
  const { waitUntil, categories, crawlActions, manualCategories } = shop;
  const { mainCategory: mainCateg } = limit;

  await performCrawlAction(page, crawlActions, waitUntil);

  const categLinks: ICategory[] = [];

  let foundCategories: ICategory[] | null = null;
  if (manualCategories && manualCategories.length) {
    categLinks.push(...manualCategories);
  }

  // main categories only from manualCategories
  if (categories.sel) {
    foundCategories = await getCategories(page, request);
    if (foundCategories) {
      categLinks.push(...foundCategories);
    }
  }

  const cntCategs = categLinks.length;

  if (cntCategs) {
    const maxCategs = mainCateg
      ? mainCateg > cntCategs
        ? cntCategs
        : mainCateg
      : cntCategs;

    // "Idealo"
    await subPageLoop({
      categories,
      categLinks,
      maxCategs,
      request,
    });
  } else {
    try {
      LoggerService.getSingleton().logger.info(
        `no categories found in ${page.url()} closing page `,
      );
    } catch (error) {
      console.log('error:', error);
    }
  }
  await closePage(page);
};
