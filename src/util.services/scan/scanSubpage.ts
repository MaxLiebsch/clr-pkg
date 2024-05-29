import { Page } from 'puppeteer1';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import { getProductCount } from '../../util/helpers';
import { StatService } from '../../util/fs/stats';
import { transformCategories } from '../../util/crawl/transformCategories';
import { closePage } from '../../util/browser/closePage';
import { ScanRequest } from '../../types/query-request';
import { scanRetrieveSubPagesRecursive } from './scanRetrieveSubPages';


export const scanSubpage = async (page: Page, request: ScanRequest) => {
  const { shop, pageInfo, queue, parentPath } = request;
  let category = null;
  const path = parentPath + '.subcategories.' + pageInfo.name;
  const statService = StatService.getSingleton(shop.d);

  category = statService.get(path);

  const { productList } = shop;

  const subCategLnks = await getCategories(page, request, true);

  const cntCategs = subCategLnks?.length ?? 0;

  const productCount = await getProductCount(page, productList);

  if (productCount) category['cnt_products'] = productCount;

  if (!category && process.env.DEBUG) console.log('failed path', path);

  if (subCategLnks && cntCategs) {
    category['cnt_category'] = cntCategs;
    category['subcategories'] = transformCategories(subCategLnks);

    for (let index = 0; index < cntCategs; index++) {
      const pageInfo: ICategory = {
        ...request.pageInfo,
        name: subCategLnks[index].name,
        link: subCategLnks[index].link,
      };
      queue.pushTask(scanRetrieveSubPagesRecursive, {
        ...request,
        retries: 0,
        pageInfo,
        parentPath: path,
      });
    }
  }

  statService.set(path, category);
  await closePage(page);

};
