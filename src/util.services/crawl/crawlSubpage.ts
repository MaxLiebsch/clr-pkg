import { Page } from 'rebrowser-puppeteer';
import { ICategory, getCategories } from '../../util/crawl/getCategories';
import { getProductCount } from '../../util/helpers';
import { retrieveSubPagesRecursive } from './retrieveSubPagesRecursive';
import { closePage } from '../../util/browser/closePage';
import { browseProductPagesQueue } from '../../util/crawl/browseProductPagesQueue';
import { CrawlerRequest } from '../../types/query-request';

export const crawlSubpage = async (page: Page, request: CrawlerRequest) => {
  const { shop, pageInfo, queue,  limit } = request;

  const { productList } = shop;
  const { subCategory: subCateg } = limit;

  const subCategLnks = await getCategories(page, request, true);

  const cntCategs = subCategLnks?.length ?? 0;

  const productCount = await getProductCount(page, productList);

  if (subCategLnks && cntCategs) {
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
