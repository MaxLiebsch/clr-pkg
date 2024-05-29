import { ElementHandle, Page } from 'puppeteer1';
import { Limit, PaginationEl } from '../../types';
import { waitForSelector } from '../helpers';

const findPagination = async (
  page: Page,
  paginationEls: PaginationEl[],
  limit?: Limit,
) => {
  if (!paginationEls.length || limit?.pages === 0)
    return {
      pagination: 'missing',
      paginationEl: {} as PaginationEl,
    };
  let pagination: ElementHandle<Element> | null = null;
  let paginationEl = paginationEls[0];

  if (paginationEl.calculation.method === 'estimate') {
    return { pagination: true, paginationEl };
  }

  for (let index = 0; index < paginationEls.length; index++) {
    paginationEl = paginationEls[index];
    const { sel } = paginationEl;

    if (sel) pagination = await waitForSelector(page, sel);

    if (pagination) break;
  }
  return { pagination, paginationEl };
};

export default findPagination;
