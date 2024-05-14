import { Page } from 'puppeteer';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import { getProductCount } from '../../util/helpers';
import { StatService } from '../../util/fs/stats';
import { retrieveSubPagesRecursive } from './retrieveSubPagesRecursive';
import { transformCategories } from '../../util/crawl/transformCategories';
import { closePage } from '../../util/browser/closePage';
import { browseProductPagesQueue } from '../../util/crawl/browseProductPagesQueue';
import { CrawlerRequest } from '../../types/query-request';

export const crawlSubpage = async (page: Page, request: CrawlerRequest) => {
  const { shop, pageInfo, queue, parentPath, onlyCrawlCategories, limit } =
    request;
  let category = null;
  const path = parentPath + '.subcategories.' + pageInfo.name;
  const statService = StatService.getSingleton(shop.d);
  if (onlyCrawlCategories) {
    category = statService.get(path);
  }

  const { categories, productList } = shop;
  const { subCategory: subCateg } = limit;

  const subCategLnks = await getCategories(
    page,
    categories,
    request.queue,
    shop.d,
    shop?.ece,
    true,
  );

  const cntCategs = subCategLnks?.length ?? 0;

  const productCount = await getProductCount(page, productList);

  if (productCount && onlyCrawlCategories)
    category['cnt_products'] = productCount;

  if (!category && onlyCrawlCategories && process.env.DEBUG)
    console.log('failed path', path);

  if (subCategLnks && cntCategs) {
    if (onlyCrawlCategories) {
      category['cnt_category'] = cntCategs;
      category['subcategories'] = transformCategories(subCategLnks);
    }

    const maxSubCategs = subCateg
      ? subCateg > cntCategs
        ? cntCategs
        : subCateg
      : cntCategs;

    for (let index = 0; index < maxSubCategs; index++) {
      const pageInfo: ICategory = {
        ...request.pageInfo,
        name: subCategLnks[index].name,
        link: subCategLnks[index].link,
      };
      queue.pushTask(retrieveSubPagesRecursive, {
        ...request,
        retries: 0,
        pageInfo,
        parentPath: path,
      });
    }
    await closePage(page);
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
