import { Page, TimeoutError } from 'puppeteer';
import { PaginationEl } from '../../types';
import {
  getElementHandleInnerText,
  getInnerText,
  myQuerySelectorAll,
} from '../helpers';
import { getNumber, getNumbers } from '../matching/compare_helper';

export const getPageNumberFromPagination = async (
  page: Page,
  paginationEl: PaginationEl,
  productCount?: number | null,
) => {
  if (!Object.keys(paginationEl).length)
    return { pages: [], noOfFoundPages: 0 };
  
  let pages: number[] = [];
  const { calculation, type } = paginationEl;
  if (calculation.method === 'button') {
    const pageButtons = await myQuerySelectorAll(page, calculation.sel);
    if (pageButtons !== 'missing' && pageButtons) {
      pages = new Array(pageButtons.length);
    }
  }
  if (calculation.method === 'first_last') {
    const last = await getInnerText(page, calculation.last);
    if (last) {
      pages = new Array(parseInt(last));
    } else {
      const next = await getInnerText(page, calculation.sel);
      if (next) {
        pages = new Array(parseInt(next));
      }
    }
  }
  if (calculation.method === 'count') {
    const paginationEls = await page.$$(calculation.sel).catch((e) => {
      if (e instanceof TimeoutError) {
        return 'missing';
      }
    });
    if (paginationEls !== 'missing' && paginationEls) {
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
      pages = new Array(pagesCount);
    }
  }

  if (calculation.method === 'match_text' && calculation.textToMatch) {
    const paginationEls = await page.$$(calculation.sel).catch((e) => {
      if (e instanceof TimeoutError) {
        return 'missing';
      }
    });
    if (paginationEls !== 'missing' && paginationEls) {
      let pagesCount = 0;
      for (let index = 0; index < paginationEls.length; index++) {
        const paginationEl = paginationEls[index];
        const innerText = await getElementHandleInnerText(paginationEl);
        if (innerText) {
          if (innerText.trim().includes(calculation.textToMatch))
            pagesCount = 1;
        }
      }
      pages = new Array(pagesCount);
    }
  }

  if (calculation.method === 'find_highest') {
    const paginationEls = await page.$$(calculation.sel).catch((e) => {
      if (e instanceof TimeoutError) {
        return 'missing';
      }
    });
    if (paginationEls !== 'missing' && paginationEls) {
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
      pages = new Array(pagesCount);
    }
  }
  if (
    calculation.method === 'estimate' &&
    productCount &&
    calculation.productsPerPage
  ) {
    pages = new Array(Math.floor(productCount / calculation.productsPerPage));
  }

  const noOfFoundPages = pages?.length ?? 0;

  return { pages, noOfFoundPages };
};
