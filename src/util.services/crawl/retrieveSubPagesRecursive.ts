import { Page } from 'puppeteer1';
import {  getProductCount } from '../..';
import { StatService } from '../../util/fs/stats';
import { getCategories } from '../../util/crawl/getCategories';
import { subPageLoop } from './crawlSubPageLoop';
import { transformCategories } from '../../util/crawl/transformCategories';
import { closePage } from '../../util/browser/closePage';
import { browseProductPagesQueue } from '../../util/crawl/browseProductPagesQueue';
import { CrawlerRequest } from '../../types/query-request';

export const retrieveSubPagesRecursive = async (
  page: Page,
  request: CrawlerRequest,
) => {
  const { shop, pageInfo, parentPath, onlyCrawlCategories, limit } = request;
  const statService = StatService.getSingleton(shop.d);
  const path = parentPath + '.subcategories.' + pageInfo.name;
  let category = null;
  if (onlyCrawlCategories) {
    category = statService.get(path);
  }
  if (!category && onlyCrawlCategories && process.env.DEBUG)
    console.log('failed path', path);
  const { categories, productList } = shop;
  const { subCategory: subCateg } = limit;

  const subsubCategLnks = await getCategories(
    page,
    categories,
    request.queue,
    shop.d,
    shop?.ece,
    true,
  );
  const productCount = await getProductCount(page, productList);
  if (productCount && onlyCrawlCategories)
    category['cnt_products'] = productCount;

  const cntSubCategs = subsubCategLnks?.length ?? 0;
  const maxSubSubCateg = subCateg
    ? subCateg > cntSubCategs
      ? cntSubCategs
      : subCateg
    : cntSubCategs;

  if (subsubCategLnks && cntSubCategs) {
    if (category) {
      category['cnt_category'] = cntSubCategs;
      category['subcategories'] = transformCategories(subsubCategLnks);
    }
    await closePage(page);
    await subPageLoop({
      parentPath: path,
      parent: pageInfo,
      request,
      categories,
      categLinks: subsubCategLnks,
      maxCategs: maxSubSubCateg,
    });
  } else {
    if (onlyCrawlCategories) {
      await closePage(page);
    } else {
      await browseProductPagesQueue(page, {
        ...request,
        limit,
        productCount,
        retries: 0,
        pageInfo,
        productPagePath: onlyCrawlCategories ? path : undefined,
      });
    }
  }
  if (onlyCrawlCategories) {
    statService.set(path, category);
  }
};
