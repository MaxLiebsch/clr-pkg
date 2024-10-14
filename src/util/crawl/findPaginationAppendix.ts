import { Page } from 'puppeteer1';
import { PaginationElement } from '../../types/paginationElement';
import { extractAttributePage } from '../helpers';

export async function findPaginationAppendix(
  paginationEls: PaginationElement[],
  page: Page,
) {
  const findPaginationAppendix = paginationEls.find(
    (el) =>
      el?.paginationUrlSchema?.calculation?.method ===
      'find_pagination_apendix',
  );
  if (findPaginationAppendix) {
    const { calculation } = findPaginationAppendix.paginationUrlSchema!;
    const { sel, type, replace } = calculation;
    if (sel && type && replace) {
      const elementText = await extractAttributePage(page, sel, type);
      if (elementText) {
        calculation.appendix = elementText;
      }
    }
  }
  
}
