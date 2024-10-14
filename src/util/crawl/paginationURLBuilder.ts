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

export const paginationUrlSchemaBuilder = async (
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
      const {
        withQuery,
        calculation: urlSchemaCalc,
        replace: urlSchemaReplace,
        replaceRegexp,
        parseAndReplace,
      } = paginationUrlSchema;
      const {
        method: urlSchemaCalcMethod,
        replace: urlSchemaCalcReplace,
        appendix,
        type,
        sel,
      } = urlSchemaCalc;

      if (withQuery && query) {
        navStr = nav.replace('<query>', encodeURIComponent(query));
      }

      if (parseAndReplace) {
        const { regexp, replace } = parseAndReplace;
        const parsedUrlPart = resultUrl.match(new RegExp(regexp));
        if (parsedUrlPart) {
          navStr = navStr.replace(replace, parsedUrlPart[0]);
        }
      }

      if (
        urlSchemaCalcMethod === 'offset' &&
        urlSchemaCalc.offset
      ) {
        let offset = urlSchemaCalc.offset;
        let pageCalculation = (pageNo - startPointSubstractor) * offset;

        process.env.DEBUG === 'true' && console.log('pageNo:', pageNo);
        if (urlSchemaCalc.startOffset) {
          pageCalculation =
            (pageNo - startPointSubstractor) * offset +
            urlSchemaCalc.startOffset;
        }

        const finalNavStr = `${navStr.replace('<page>', pageCalculation.toString())}`;

        if(replaceRegexp){
          const replaceRegExp = new RegExp(replaceRegexp);
          if(replaceRegExp.test(resultUrl)){
            return resultUrl.replace(replaceRegExp, finalNavStr);
          }
        }

        if (urlSchemaReplace === 'attach_end') {
          return resultUrl + finalNavStr;
        }

        return resultUrl;
      }

      if (urlSchemaCalcMethod === 'replace_append' && urlSchemaCalcReplace) {
        urlSchemaCalcReplace.forEach((_replace) => {
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

      if (urlSchemaCalcMethod === 'find_pagination_apendix' && appendix) {
        if (sel && type && urlSchemaCalcReplace) {
          process.env.DEBUG === 'true' &&
            console.log(url, urlSchemaCalc.sel, appendix, pageNo);
          if (appendix) {
            if (urlSchemaCalcReplace?.length) {
              const replace = urlSchemaCalcReplace[0];
              const { search } = replace;
              const match = appendix.match(new RegExp(search));
              if (match) {
                navStr = navStr.replaceAll(replace.replace!, match[0]);
                navStr = navStr.replaceAll('<page>', pageNo.toString());
                resultUrl = resultUrl + navStr;
              } else {
                console.log('No match found for:', search);
              }
            }
          } else {
            console.log('No element text found for:', sel);
          }
        }
      }
    }
  }
  return resultUrl;
};
