import { PaginationEl, PaginationUrlSchema } from '../types';

export const paginationUrlBuilder = (
  url: string,
  paginationEls: PaginationEl[],
  pageNo: number,
  query?: string,
) => {
  let resultUrl = url;
  for (let index = 0; index < paginationEls.length; index++) {
    const element = paginationEls[index];
    let navStr = element.nav
    const { paginationUrlSchema, nav } = element;
    if (paginationUrlSchema) {
      const { withQuery, calculation, replace } = paginationUrlSchema;
      if (withQuery && query) {
        navStr = nav.replace('<query>', encodeURIComponent(query));
      }
      if (calculation.method === 'offset') {
        const replaceRegExp = new RegExp(replace);
        if (replaceRegExp.test(resultUrl)) {
          return resultUrl.replace(
            replaceRegExp,
            `${navStr.replace('<page>', ((pageNo - 1) * calculation.offset).toString())}`,
          );
        }
        return resultUrl;
      }
    }
  }
  return resultUrl
};
