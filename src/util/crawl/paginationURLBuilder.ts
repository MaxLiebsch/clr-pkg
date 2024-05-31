

import { PaginationElement } from '../../types/paginationElement';

export const paginationUrlBuilder = (
  url: string,
  paginationEls: PaginationElement[],
  pageNo: number,
  query?: string,
) => {
  let resultUrl = url;
  let startPointSubstractor = 1;
  for (let index = 0; index < paginationEls.length; index++) {
    const element = paginationEls[index];
    let navStr = element.nav;
    const { paginationUrlSchema, nav } = element;
    if (paginationUrlSchema) {
      const { withQuery, calculation, replace } = paginationUrlSchema;
      if (withQuery && query) {
        navStr = nav.replace('<query>', encodeURIComponent(query));
      }

      if (paginationUrlSchema.parseAndReplace) {
        const { regexp, replace } = paginationUrlSchema.parseAndReplace;
        const parsedUrlPart = resultUrl.match(new RegExp(regexp));
        if (parsedUrlPart) {
          navStr = navStr.replace(replace, parsedUrlPart[0]);
        }
      }

      if (calculation.method === 'offset') {
        const finalNavStr = `${navStr.replace('<page>', ((pageNo - startPointSubstractor) * calculation.offset).toString())}`;
        const replaceRegExp = new RegExp(replace);
        if (replaceRegExp.test(resultUrl)) {
          return resultUrl.replace(replaceRegExp, finalNavStr);
        }
        if (replace === 'attach_end') {
          return resultUrl + finalNavStr;
        }

        return resultUrl;
      }

      if ('replace' in calculation && calculation.method === 'replace_append') {
        calculation.replace!.forEach((_replace) => {
          if ('replace' in _replace) {
            resultUrl = resultUrl.replaceAll(_replace.search, _replace.replace!);
          }
          if ('use' in _replace) {
            if (_replace.use === 'skip' && 'skip' in _replace) {
              navStr = navStr.replaceAll(
                _replace.search,
                (pageNo * _replace.skip!).toString(),
              );
            }
          }
        });
        resultUrl = resultUrl + navStr;
      }
    }
  }
  return resultUrl;
};
