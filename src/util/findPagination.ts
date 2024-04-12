import { ElementHandle, Page } from 'puppeteer';
import { PaginationEl } from '../types';
import { waitForSelector } from './helpers';

const findPagination = async (page: Page, paginationEls: PaginationEl[]) => {
  if (!paginationEls.length)
    return {
      pagination: 'missing',
      paginationEl: {} as PaginationEl,
    };
  let pagination:
    | ElementHandle<Element>
    | 'missing'
    | null
    | undefined
    | boolean;
  let paginationEl = paginationEls[0];

  if (paginationEl.calculation.method === 'estimate') {
    return { pagination: true, paginationEl };
  }

  for (let index = 0; index < paginationEls.length; index++) {
    paginationEl = paginationEls[index];
    const { sel } = paginationEl;

    pagination = sel ? await waitForSelector(page, sel) : 'missing';

    if (pagination !== 'missing' && pagination) break;
  }
  return { pagination, paginationEl };
};

export default findPagination;
