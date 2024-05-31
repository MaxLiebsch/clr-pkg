import { ScanRequest } from '../../types/query-request';
import { scanSubpage } from './scanSubpage';
import { ICategory } from '../../util/crawl/getCategories';
import { Categories } from '../../types/categories';

export const scanSubpageLoop = async (options: {
  parentPath: string;
  parent: ICategory;
  request: ScanRequest;
  categLinks: ICategory[];
  categories: Categories;
}) => {
  const { categLinks, request, parentPath } = options;

  const { queue } = request;
  for (let a = 0; a < categLinks.length; a++) {
    const pageInfo = {
      ...request.pageInfo,
      name: categLinks[a].name,
      link: categLinks[a].link,
    };
    queue.pushTask(scanSubpage, {
      ...request,
      retries: 0,
      parentPath,
      pageInfo,
    });
  }
};
