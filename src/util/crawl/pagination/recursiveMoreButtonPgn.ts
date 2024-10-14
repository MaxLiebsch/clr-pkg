import { Page } from 'puppeteer1';
import { clickBtn, humanScroll, waitForSelector } from '../../helpers';
import { Shop, WaitUntil } from '../../../types/shop';

interface RecursiveMoreButtonPgnOpts {
  page: Page;
  sel: string;
  limit: number;
  wait?: boolean;
  waitUntil: WaitUntil;
  shop: Shop;
  expect?: any;
}

export async function recursiveMoreButtonPgn({
  limit,
  page,
  sel,
  wait,
  waitUntil,
  shop,
}: RecursiveMoreButtonPgnOpts) {
  let exists = true;
  let cnt = 0;
  while (exists && cnt < limit - 1) {
    cnt++;
    const btn = await waitForSelector(page, sel, undefined, true);
    if (btn) {
      await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
      const shouldscroll = shop.crawlActions
        ? shop.crawlActions.some((action) => action.type === 'scroll')
        : false;
      if (shouldscroll) {
        await humanScroll(page);
      }
    } else {
      exists = false;
    }
  }
  return {cnt, exists}
}
