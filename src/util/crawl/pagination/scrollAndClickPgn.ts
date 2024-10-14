import { Page } from 'puppeteer1';
import { clickBtn, humanScroll, waitForSelector } from '../../helpers';
import { WaitUntil } from '../../../types/shop';

interface ScrollAndClickPgnOpts {
  page: Page;
  sel: string;
  limit: number;
  wait?: boolean;
  waitUntil: WaitUntil;
}

export async function scrollAndClickPgn({
  page,
  sel,
  limit,
  wait,
  waitUntil,
}: ScrollAndClickPgnOpts) {
  let exists = true;
  let cnt = 0;
  while (exists && cnt < limit - 1) {
    cnt++;
    await humanScroll(page);
    const btn = await waitForSelector(page, sel, 500, true);
    if (btn) {
      await clickBtn(page, sel, wait ?? false, waitUntil, undefined);
    }
  }
  return { cnt, exists };
}
