import { Page } from 'puppeteer1';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import {  StatService } from '../../util/fs/stats';
import { transformCategories } from '../../util/crawl/transformCategories';
import { closePage } from '../../util/browser/closePage';
import { LoggerService } from '../../util/logger';
import { ScanRequest } from '../../types/query-request';
import { scanSubpageLoop } from './scanSubpageLoop';
import { ICategoryStats } from '../../types/Sitemap';

export const scanShop = async (page: Page, request: ScanRequest) => {
  const { pageInfo, shop, queue, parentPath, infos } = request;
  const { categories, d } = shop;
  const statService = StatService.getSingleton(d);

  const categLinks: ICategory[] = [];
  
  let foundCategories: ICategory[] | null = null;
  if (shop.manualCategories.length) {
    categLinks.push(...shop.manualCategories);
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
    infos.total += cntCategs;
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

    await scanSubpageLoop({
      parentPath,
      parent: pageInfo,
      categories,
      categLinks,
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
