import { Page } from 'puppeteer1';
import {
  extractAttributePage,
  getElementHandleInnerText,
  getInnerText,
  getProductCount,
  myQuerySelectorAll,
} from '../helpers';
import { getNumber, getNumbers } from '../matching/compare_helper';
import { PaginationElement } from '../../types/paginationElement';
import { Shop } from '../../types/shop';

/**
 * Retrieves the page numbers from a pagination element.
 *
 * @param page - The page object.
 * @param shop - The shop object.
 * @param paginationEl - The pagination element.
 * @param productCount - The number of products (optional).
 * @returns An object containing the array of page numbers and the number of found pages.


  Possible Options:
  - button: The page numbers are buttons.
  - first_last: The page numbers are the first and last page numbers.
  - count: The page numbers are are retrieved from the element with the highest number in their text.
  - match_text: The page numbers match a specific text then add exactly 1 page.
  - find_highest: The page numbers are the highest number found in button/elements text
  - estimate: The page numbers are estimated from the researched number of products per page.
  - product_count: The page numbers are calculated from the product count element .
  - element_attribute: The page numbers are the attribute of the element.
 
*/

export const getPageNumberFromPagination = async (
  page: Page,
  shop: Shop,
  paginationEl: PaginationElement,
  currentPage?: number,
  productCount?: number | null,
) => {
  let pageCount = 0;
  if (!Object.keys(paginationEl).length) return pageCount;

  const {
    calculation: paginationCalc,
    type,
    sel: paginationSel,
  } = paginationEl;
  const {
    method: calMethod,
    productsPerPage,
    attribute,
    textToMatch,
    sel: paginationCalcSel,
    last: lastSel,
  } = paginationCalc;
  if (calMethod === 'button') {
    const pageButtons = await myQuerySelectorAll(page, paginationCalcSel);
    if (pageButtons) {
      pageCount = pageButtons.length;
    }
  }
  if (calMethod === 'first_last') {
    const last = await getInnerText(page, lastSel);
    if (last) {
      pageCount = parseInt(last);
    } else {
      const next = await getInnerText(page, paginationCalcSel);
      if (next) {
        pageCount = parseInt(next);
      }
    }
  }
  if (calMethod === 'count') {
    const paginationEls = await myQuerySelectorAll(page, paginationCalcSel);
    if (paginationEls) {
      let pagesCount = 0;
      for (let index = 0; index < paginationEls.length; index++) {
        const paginationEl = paginationEls[index];
        const innerText = await getElementHandleInnerText(paginationEl);
        if (innerText) {
          const parsedNumber = getNumber(innerText);
          if (parsedNumber && parsedNumber > pagesCount) {
            pagesCount = parsedNumber;
          }
        }
      }
      pageCount = pagesCount;
    }
  }

  if (calMethod === 'match_text' && textToMatch) {
    const paginationEls = await myQuerySelectorAll(page, paginationCalcSel);
    if (paginationEls) {
      let pagesCount = 0;
      for (let index = 0; index < paginationEls.length; index++) {
        const paginationEl = paginationEls[index];
        const innerText = await getElementHandleInnerText(paginationEl);
        if (innerText) {
          if (innerText.trim().includes(textToMatch))
            pagesCount = (currentPage ?? 0) + 1;
        }
      }
      pageCount = pagesCount;
    }
  }

  if (calMethod === 'find_highest') {
    const paginationEls = await myQuerySelectorAll(page, paginationCalcSel);
    if (paginationEls) {
      let pagesCount = 0;
      for (let index = 0; index < paginationEls.length; index++) {
        const paginationEl = paginationEls[index];
        const innerText = await getElementHandleInnerText(paginationEl);
        if (innerText) {
          const numbers = getNumbers(innerText);
          if (numbers) {
            numbers.map((number) => {
              const parsedNumber = parseInt(number);
              if (number && parsedNumber > pagesCount)
                pagesCount = parsedNumber;
            });
          }
        }
      }
      pageCount = pagesCount;
    }
  }
  if (calMethod === 'estimate' && productCount && productsPerPage) {
    pageCount = Math.floor(productCount / productsPerPage);
  }

  if (calMethod === 'product_count' && productsPerPage) {
    const count = await getProductCount(page, shop.productList);
    if (count) {
      pageCount = Math.floor(count / productsPerPage);
    }
  }

  if (calMethod === 'element_attribute' && attribute) {
    const element = await extractAttributePage(page, paginationSel, attribute);
    if (element && Number(element)) {
      pageCount = parseInt(element);
    }
  }

  return pageCount;
};
