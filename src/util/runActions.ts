import { Page } from 'puppeteer';
import { ShopObject } from '../types';
import { clickBtn, clickShadowBtn, waitForSelector } from './helpers';

export async function runActions(page: Page, shop: ShopObject) {
  const { actions, waitUntil } = shop;
  if (shop.actions) {
    for (const action of actions) {
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
      if (type === 'button' && 'wait' in action && 'waitDuration' in action) {
        await clickBtn(
          page,
          sel,
          action.wait ?? false,
          waitUntil,
          action.waitDuration,
        );
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
    }
  }
}
