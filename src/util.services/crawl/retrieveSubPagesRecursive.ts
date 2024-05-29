import { Page } from 'puppeteer1';
import { getProductCount } from '../..';
import { getCategories } from '../../util/crawl/getCategories';
import { subPageLoop } from './crawlSubPageLoop';
import { closePage } from '../../util/browser/closePage';
import { browseProductPagesQueue } from '../../util/crawl/browseProductPagesQueue';
import { CrawlerRequest } from '../../types/query-request';

export const retrieveSubPagesRecursive = async (
  page: Page,
  request: CrawlerRequest,
) => {
  const { shop, pageInfo,limit } = request;


  const { categories, productList } = shop;
  const { subCategory: subCateg } = limit;

  const subsubCategLnks = await getCategories(page, request, true);

  const productCount = await getProductCount(page, productList);

  const cntSubCategs = subsubCategLnks?.length ?? 0;
  const maxSubSubCateg = subCateg
    ? subCateg > cntSubCategs
      ? cntSubCategs
      : subCateg
    : cntSubCategs;

  if (subsubCategLnks && cntSubCategs) {
    await closePage(page);
    await subPageLoop({
      request,
      categories,
      categLinks: subsubCategLnks,
      maxCategs: maxSubSubCateg,
    });
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
