import { Page } from 'rebrowser-puppeteer';
import { ProductList } from '../../types/productList';
import { waitForSelector } from '../helpers';

export async function findProductContainer(
  productList: ProductList[],
  page: Page,
) {
  for (let index = 0; index < productList.length; index++) {
    const { sel, product, timeout } = productList[index];
    const selector = await waitForSelector(page, sel, timeout ?? 5000, false);
    if (selector) {
      return { selector: sel, index };
    }
  }
}
