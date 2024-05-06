import { Page } from 'puppeteer';
import { ICategory, getCategories } from './getCategories';
import { ICategoryStats, StatService } from './fs/stats';
import { subPageLoop } from './crawlSubPageLoop';
import { performCrawlAction } from './performCrawlaction';
import { transformCategories } from './transformCategories';
import { closePage } from './closePage';
import { LoggerService } from './logger';
import { CrawlerRequest } from '../types/query-request';

export const crawlShop = async (page: Page, request: CrawlerRequest) => {
  const { pageInfo, shop, queue, onlyCrawlCategories, limit } = request;
  const { waitUntil, categories, d, crawlActions } = shop;
  const { mainCategory: mainCateg } = limit;
  const statService = StatService.getSingleton(d);

  await performCrawlAction(page, crawlActions, waitUntil);

  const categLinks: ICategory[] = [];
  if (shop.manualCategories.length) {
    categLinks.push(...shop.manualCategories);
  }

  const foundCategories = await getCategories(page, categories, queue, d);

  if (foundCategories) {
    categLinks.push(...foundCategories);
  }
  const cntCategs = categLinks.length;

  if (cntCategs) {
    if (onlyCrawlCategories) {
      const subcategories = transformCategories(
        categLinks.filter((pageInfo) => !queue.linkExists(pageInfo.link)),
      );
      const stats: ICategoryStats = {
        default: {},
        name: shop.d,
        link: pageInfo.link,
        cnt_category: cntCategs,
        subcategories,
      };
      statService.set('sitemap', stats);
    }

    await closePage(page);

    const maxCategs = mainCateg
    ? mainCateg > cntCategs
    ? cntCategs
    : mainCateg
    : cntCategs;

    // "Idealo"
    await subPageLoop({
      parentPath: 'sitemap',
      parent: pageInfo,
      categories,
      categLinks,
      maxCategs,
      request,
    });
  } else {
    try {
      LoggerService.getSingleton().logger.info(`no categories found in ${page.url()} closing page `)
    } catch (error) {
      console.log('error:', error)
    }
    await closePage(page);
  }
};
