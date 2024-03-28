import { Page } from 'puppeteer';
import { CrawlerRequest, browseProductpages, getProductCount } from '..';
import { StatService, SubCategories } from './fs/stats';
import { ICategory, getCategories } from './getCategories';
import { subPageLoop } from './crawlSubPageLoop';
import { transformCategories } from './transformCategories';
import { closePage } from './closePage';

export const retrieveSubPagesRecursive = async (
  page: Page,
  request: CrawlerRequest,
) => {
  const {
    shop,
    addProduct,
    pageInfo,
    queue,
    parentPath,
    onlyCrawlCategories,
    limit,
  } = request;
  const statService = StatService.getSingleton(shop.d);
  const path = parentPath + '.subcategories.' + pageInfo.name;
  let category = null;
  if (onlyCrawlCategories) {
    category = statService.get(path);
  }
  if(!category && onlyCrawlCategories && process.env.DEBUG) console.log('failed path', path)
  const { categories, productList } = shop;
  const { subCategory: subCateg } = limit;

  const subsubCategLnks = await getCategories(
    page,
    categories,
    request.queue,
    shop.d,
    true,
  );
  const productCount = await getProductCount(page, productList);
  if (productCount && onlyCrawlCategories) category['cnt_products'] = productCount;

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
    const categoryCntKey = path + '.cnt_category';
    const subCategPath = path + '.subcategories';
    
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
      await browseProductpages(
        page,
        request.shop,
        addProduct,
        pageInfo,
        limit,
        onlyCrawlCategories? path: undefined,
      );
    }
  }
  if (onlyCrawlCategories) {
    statService.set(path, category);
  }
};
