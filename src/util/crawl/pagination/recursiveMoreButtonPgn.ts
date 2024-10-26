import { Page } from 'rebrowser-puppeteer';
import { clickBtn, humanScroll, waitForSelector } from '../../helpers';
import { Shop, WaitUntil } from '../../../types/shop';

interface RecursiveMoreButtonPgnOpts {
  page: Page;
  sel: string;
  limit: number;
  wait?: boolean;
  waitUntil: WaitUntil;
  shop: Shop;
  visible?: boolean;
  expect?: any;
}

export async function recursiveMoreButtonPgn({
  limit,
  page,
  sel,
  wait,
  waitUntil,
  visible,
  shop,
}: RecursiveMoreButtonPgnOpts) {
  let exists = true;
  let cnt = 0;
  let lastScrollPosition = 0;
  while (exists && cnt < limit) {
    cnt++;
    const btn = await waitForSelector(page, sel, undefined, Boolean(visible));
    if (btn) {
      await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
      const shouldscroll = shop.crawlActions
        ? shop.crawlActions.some((action) => action.type === 'scroll')
        : false;
      if (shouldscroll) {
        lastScrollPosition = await humanScroll(page,lastScrollPosition);
        process.env.DEBUG === 'true' && console.log('lastScrollPosition:', lastScrollPosition);
      }
    } else {
      exists = false;
    }
  }
  return { cnt, exists };
}
