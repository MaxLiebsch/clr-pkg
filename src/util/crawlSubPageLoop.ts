import { Categories } from '../types';
import { CrawlerRequest } from '../types/query-request';
import { crawlSubpage } from './crawlSubpage';
import { ICategory } from './getCategories';

export const subPageLoop = async (options: {
  parentPath: string;
  parent: ICategory;
  request: CrawlerRequest;
  maxCategs: number;
  categLinks: ICategory[];
  categories: Categories;
}) => {
  const { maxCategs, categLinks, categories, request, parent, parentPath } =
    options;

  const { shop, queue } = request;
  for (let a = 0; a < maxCategs; a++) {
    const pageInfo = {
      ...request.pageInfo,
      name: categLinks[a].name,
      link: categLinks[a].link,
    };
    queue.pushTask(crawlSubpage, {
      ...request,
      retries: 0,
      parentPath,
      pageInfo,
    });
  }
};
