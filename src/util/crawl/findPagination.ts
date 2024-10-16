import { ElementHandle, Page } from 'puppeteer1';
import { Limit } from '../../types';
import { waitForSelector } from '../helpers';
import { PaginationElement } from '../../types/paginationElement';

const findPagination = async (
  page: Page,
  paginationEls: PaginationElement[],
  limit?: Limit,
) => {
  if (!paginationEls.length || limit?.pages === 0)
    return {
      pagination: null,
      paginationEl: {} as PaginationElement,
    };
  let pagination: ElementHandle<Element> | null = null;
  let paginationEl = paginationEls[0];

  if (paginationEl.calculation.method === 'estimate') {
    return { pagination: true, paginationEl };
  }

  for (let index = 0; index < paginationEls.length; index++) {
    paginationEl = paginationEls[index];
    const { sel, visible } = paginationEl;

    if (sel) pagination = await waitForSelector(page, sel, 5000, !!visible);

    process.env.DEBUG && console.log('findPagination:pagination:', pagination);

    if (pagination) break;
  }
  return { pagination, paginationEl };
};

export default findPagination;
