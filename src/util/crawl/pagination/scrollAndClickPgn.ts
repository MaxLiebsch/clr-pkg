import { Page } from 'rebrowser-puppeteer';
import { clickBtn, humanScroll, waitForSelector } from '../../helpers';
import { WaitUntil } from '../../../types/shop';

interface ScrollAndClickPgnOpts {
  page: Page;
  sel: string;
  limit: number;
  wait?: boolean;
  visible?: boolean;
  endOfPageSel?: string;
  waitUntil: WaitUntil;
  pageCount?: number
}

export async function scrollAndClickPgn({
  page,
  sel,
  limit,
  wait,
  visible,
  endOfPageSel,
  waitUntil,
  pageCount
}: ScrollAndClickPgnOpts) {
  let exists = true;
  let cnt = 0;
  let lastScrollPosition = 0;

  while (exists && cnt < limit) {
    cnt++;
    lastScrollPosition = await humanScroll(page, lastScrollPosition);
    process.env.DEBUG === 'true' && console.log('lastScrollPosition:', lastScrollPosition)
    const btn = await waitForSelector(page, sel, 500, Boolean(visible));
    if (btn) {
      await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
    }
    if(endOfPageSel){
      exists = await page.$(endOfPageSel) !== null;
    }

    if(pageCount && cnt > pageCount){
      exists = false;
    }
    
  }
  return { cnt, exists };
}
