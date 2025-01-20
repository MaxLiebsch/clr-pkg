import { ScrapeRequest } from '../../types/query-request';
import { crawlSubpage } from './crawlSubpage';
import { ICategory } from '../../util/crawl/getCategories';
import { Categories } from '../../types/categories';

export const subPageLoop = async (options: {
  request: ScrapeRequest;
  maxCategs: number;
  categLinks: ICategory[];
  categories: Categories;
}) => {
  const { maxCategs, categLinks, request } = options;

  const { queue } = request;
  for (let a = 0; a < maxCategs; a++) {
    const pageInfo = {
      ...request.pageInfo,
      name: categLinks[a].name,
      link: categLinks[a].link,
    };
    queue.pushTask(crawlSubpage, {
      ...request,
      retries: 0,
      pageInfo,
    });
  }
};
