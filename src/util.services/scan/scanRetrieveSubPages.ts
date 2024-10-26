import { Page } from 'rebrowser-puppeteer';
import { getProductCount } from '../..';
import { StatService } from '../../util/fs/stats';
import { getCategories } from '../../util/crawl/getCategories';
import { transformCategories } from '../../util/crawl/transformCategories';
import { closePage } from '../../util/browser/closePage';
import {  ScanRequest } from '../../types/query-request';
import { scanSubpageLoop } from './scanSubpageLoop';

export const scanRetrieveSubPagesRecursive = async (
  page: Page,
  request: ScanRequest,
) => {
  const { shop, pageInfo, parentPath } = request;
  const statService = StatService.getSingleton(shop.d);
  const path = parentPath + '.subcategories.' + pageInfo.name;
  
  let category = null;

  category = statService.get(path);

  if (!category && process.env.DEBUG) console.log('failed path', path);
  const { categories, productList } = shop;

  const subsubCategLnks = await getCategories(page, request, true);
  const productCount = await getProductCount(page, productList);
  if (productCount) category['cnt_products'] = productCount;

  const cntSubCategs = subsubCategLnks?.length ?? 0;

  if (subsubCategLnks && cntSubCategs) {
    if (category) {
      category['cnt_category'] = cntSubCategs;
      category['subcategories'] = transformCategories(subsubCategLnks);
    }
    await closePage(page);
    await scanSubpageLoop({
      parentPath: path,
      parent: pageInfo,
      request,
      categories,
      categLinks: subsubCategLnks,
    });
  } else {
    await closePage(page);
  }

  statService.set(path, category);
};
