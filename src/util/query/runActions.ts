import { Page } from 'puppeteer1';
import { ShopObject } from '../../types';
import { clickBtn, clickShadowBtn, waitForSelector } from '../helpers';
import { RECURSIVE_BUTTON_SAFEGUARD } from '../../constants';

export async function runActions(
  page: Page,
  shop: ShopObject,
  type: 'query' | 'crawl' | 'standard' = 'standard',
) {
  const { waitUntil } = shop;

  const actionTypeMap = {
    standard: shop?.actions,
    crawl: shop?.crawlActions,
    query: shop?.queryActions,
  };

  const actions = actionTypeMap[type];

  if (actions) {
    for (const action of actions) {
      const { sel, type } = action;
      const selector = await waitForSelector(
        page,
        sel,
        type === 'shadowroot-button' ? 7000 : 5000,
        type !== 'shadowroot-button',
      );
      if (!selector) {
        continue;
      }
      if (type === 'button' && 'wait' in action) {
        await clickBtn(
          page,
          sel,
          action.wait ?? false,
          waitUntil,
          'waitDuration' in action ? action.waitDuration : undefined,
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
      if (type === 'recursive-button' && 'waitDuration' in action) {
        let safeguard = 0;
        while (true) {
          safeguard++;
          if (safeguard >= RECURSIVE_BUTTON_SAFEGUARD) {
            break;
          }
          const btn = await waitForSelector(
            page,
            action.sel,
            action.waitDuration,
            true,
          );
          if (btn) {
            await clickBtn(
              page,
              action.sel,
              action.wait ?? false,
              waitUntil,
              undefined,
            );
          } else {
            break;
          }
        }
      }
    }
  }
}
