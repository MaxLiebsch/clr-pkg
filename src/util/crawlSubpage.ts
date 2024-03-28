import { Page } from 'puppeteer';
import { getCategories } from './getCategories';
import { browseProductpages } from './browseProductPages';
import { CrawlerRequest } from './queue';
import { getProductCount } from './helpers';
import { StatService } from './fs/stats';
import { retrieveSubPagesRecursive } from './retrieveSubPagesRecursive';
import { transformCategories } from './transformCategories';
import { closePage } from './closePage';

export const crawlSubpage = async (page: Page, request: CrawlerRequest) => {
  const {
    shop,
    pageInfo,
    addProduct,
    queue,
    parent,
    parentPath,
    onlyCrawlCategories,
    limit
  } = request;
  let category = null;
  const path = parentPath + '.subcategories.' + pageInfo.name;
  const statService = StatService.getSingleton(shop.d);
  if (onlyCrawlCategories) {
    category = statService.get(path);
  }

  const {  categories, productList } = shop;
  const { subCategory: subCateg } = limit;

  const subCategLnks = await getCategories(
    page,
    categories,
    request.queue,
    shop.d,
    true,
  );

  const cntCategs = subCategLnks?.length ?? 0;

  const productCount = await getProductCount(page, productList);
  if (productCount && onlyCrawlCategories) category['cnt_products'] = productCount;
  if(!category && onlyCrawlCategories && process.env.DEBUG) console.log('failed path', path)
  if (subCategLnks && cntCategs) {
    if (onlyCrawlCategories) {
      category['cnt_category'] = cntCategs;
      category['subcategories'] = transformCategories(subCategLnks);
    }

    await closePage(page);

    const maxSubCategs = subCateg
    ? subCateg > cntCategs
    ? cntCategs
    : subCateg
    : cntCategs;
     
    for (let index = 0; index < maxSubCategs; index++) {
      const pageInfo = {
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
  } else {
    if (onlyCrawlCategories) {
      await closePage(page);
    } else {
      await browseProductpages(
        page,
        shop,
        addProduct,
        pageInfo,
        limit,
        onlyCrawlCategories ? path : undefined,
      );
    }
  }
  if (onlyCrawlCategories) {
    statService.set(path, category);
  }
};
