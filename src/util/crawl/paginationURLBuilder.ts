import { Page } from 'puppeteer1';
import { PaginationElement } from '../../types/paginationElement';
import { extractAttributePage } from '../helpers';

/**
 * Builds a pagination URL based on the provided URL, pagination elements, page number, and optional query.
 *
 * @param url - The base URL to which pagination parameters will be appended.
 * @param paginationEls - An array of pagination elements that define how the pagination should be constructed.
 * @param pageNo - The current page number to be used in the pagination URL.
 * @param query - An optional query string to be included in the pagination URL.
 * @returns The constructed pagination URL.
 *
 * The function processes each pagination element and applies the defined pagination schema, which may include:
 * - Replacing parts of the URL with query parameters.
 * - Parsing and replacing parts of the URL based on regular expressions.
 * - Calculating offsets for pagination.
 * - Appending or replacing parts of the URL based on the pagination schema.
 */

export const paginationUrlBuilder = async (
  url: string,
  paginationEls: PaginationElement[],
  pageNo: number,
  page: Page | null,
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
            resultUrl = resultUrl.replaceAll(
              _replace.search,
              _replace.replace!,
            );
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

      if (
        calculation.method === 'find_pagination_apendix' &&
        calculation.appendix
      ) {
        if (
          'sel' in calculation &&
          'type' in calculation &&
          'replace' in calculation
        ) {
          const elementText = calculation.appendix;
          process.env.DEBUG === 'true' &&
            console.log(
              url,
              calculation.sel,
              elementText,
              pageNo,
            );
          if (elementText) {
            const { replace } = calculation;
            if (replace?.length) {
              const match = elementText.match(new RegExp(replace[0].search));
              if (match) {
                navStr = navStr.replaceAll(replace[0].replace!, match[0]);
                navStr = navStr.replaceAll('<page>', pageNo.toString());
                resultUrl = resultUrl + navStr;
              } else {
                console.log('No match found for:', replace[0].search);
              }
            }
          } else {
            console.log('No element text found for:', calculation.sel);
          }
        }
      }
    }
  }
  return resultUrl;
};
