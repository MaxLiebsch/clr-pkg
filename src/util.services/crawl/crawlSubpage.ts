import { Page } from 'rebrowser-puppeteer';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import { getProductCount } from '../../util/helpers';
import { retrieveSubPagesRecursive } from './retrieveSubPagesRecursive';
import { closePage } from '../../util/browser/closePage';
import { browseProductPagesQueue } from '../../util/crawl/browseProductPagesQueue';
import { ScrapeRequest } from '../../types/query-request';

export const crawlSubpage = async (page: Page, request: ScrapeRequest) => {
  const { shop, pageInfo, queue, limit, updateProductLimit } = request;

  const { productList } = shop;
  const { subCategory: subCateg } = limit;

  const subCategLnks = await getCategories(page, request, true);

  const totalCategories = subCategLnks?.length ?? 0;

  const productCount = await getProductCount(page, productList);

  if (productCount !== null && productCount > 0 && updateProductLimit) {
    updateProductLimit(productCount);
  }

  if (subCategLnks && totalCategories) {
    const maxSubCategs = subCateg
      ? subCateg > totalCategories
        ? totalCategories
        : subCateg
      : totalCategories;

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
      });
    }
    await closePage(page);
  } else {
    await browseProductPagesQueue(page, {
      ...request,
      limit,
      productCount,
      retries: 0,
      pageInfo,
    });
  }
};
