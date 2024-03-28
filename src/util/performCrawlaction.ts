import { Page } from 'puppeteer';
import { clickBtn, clickShadowBtn, waitForSelector } from './helpers';
import { CrawlAction, WaitUntil } from '../types';

export async function performCrawlAction(
  page: Page,
  crawlAction: CrawlAction[],
  waitUntil: WaitUntil,
) {
  for (const action of crawlAction) {
    const { sel, type } = action;
    const selector = await waitForSelector(
      page,
      sel,
      type === 'shadowroot-button' ? 7000 : 5000,
      type !== 'shadowroot-button',
    );
    if (selector === 'missing' || !selector) {
      continue;
    }
    if (type === 'button' && 'wait' in action) {
      await clickBtn(page, sel, action.wait ?? false, waitUntil);
    }
    if (type === 'shadowroot-button' && 'btn_sel' in action) {
      await clickShadowBtn(
        page,
        selector,
        action.btn_sel ?? '',
        action.wait ?? false,
        waitUntil,
      );
    }
    if ('target' in action) {
      if (action.target) {
        const selector = await waitForSelector(page, action.target);
        if (selector === 'missing') {
          continue;
        }
      }
    }
  }
}
