import { ElementHandle, Page } from 'rebrowser-puppeteer';
import { clickBtn, clickShadowBtn, waitForSelector } from '../helpers';
import { RECURSIVE_BUTTON_SAFEGUARD } from '../../constants';
import { Query } from '../../types/query';
import { Shop } from '../../types/shop';
import { get } from 'underscore';
import { sleep } from '../extract';

export async function runActions(
  page: Page,
  shop: Shop,
  type: 'query' | 'crawl' | 'standard' = 'standard',
  query?: Query,
  step?: number,
) {
  const { waitUntil } = shop;

  const actionTypeMap = {
    standard: shop?.actions,
    crawl: shop?.crawlActions,
    query: shop?.queryActions,
  };

  let actions = actionTypeMap[type];

  if (!actions) {
    return;
  }

  if (step) {
    actions = actions.filter((a) => a.step === step);
  }

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
        if (action?.action === 'waitBefore') {
          await new Promise((r) => setTimeout(r, 600));
        }
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
      if (query) {
        if (
          type === 'shadowroot-input' &&
          'input_sel' in action &&
          'what' in action
        ) {
          const { sel, input_sel } = action;
          const inputHandle = await page.evaluateHandle(
            (sel, input_sel) => {
              // Find the element hosting the shadow root
              const hostElement = document.querySelector(sel);

              // Access the shadow root
              if (!hostElement) return console.error('hostElement not found');
              const shadowRoot = hostElement.shadowRoot;

              // Find the input element within the shadow root
              if (!shadowRoot) return console.error('shadowRoot not found');
              const input = shadowRoot.querySelector(input_sel as string);
              return input;

              // Set the value of the input element7
            },
            sel,
            input_sel,
          );

          if (!inputHandle) return console.error('inputHandle not found');
          await (inputHandle as ElementHandle<HTMLInputElement>).focus();

          if ('clear' in action && action.clear) {
            await (inputHandle as ElementHandle<HTMLInputElement>).evaluate(
              (element) => {
                element.value = '';
              },
            );
          }
          await (inputHandle as ElementHandle<HTMLInputElement>).type(
            get(query, action.what[0].split('.'), 'blub') as string,
            { delay: 50 },
          );
          if ('blur' in action && action.blur) {
            await (inputHandle as ElementHandle<HTMLInputElement>).evaluate(
              (element) => element.blur(),
            );
          }
        }
      }
      if (type === 'shadowroot-button-test' && 'btn_sel' in action) {
        if (action?.action === 'waitBefore') {
          await new Promise((r) => setTimeout(r, 600));
        }
        const { sel, btn_sel } = action;
        const btnHandle = await page.evaluateHandle(
          (sel, btn_sel) => {
            // Find the element hosting the shadow root
            const hostElement = document.querySelector(sel as string);

            // Access the shadow root
            if (!hostElement) return console.error('hostElement not found');
            const shadowRoot = hostElement.shadowRoot;

            // Find the input element within the shadow root
            if (!shadowRoot) return console.error('shadowRoot not found');
            const btn = shadowRoot.querySelector(btn_sel as string);
            return btn;

            // Set the value of the input element7
          },
          sel,
          btn_sel,
        );
        if (!btnHandle) return console.error('inputHandle not found');

        await (btnHandle as ElementHandle<HTMLButtonElement>).focus();
        await (btnHandle as ElementHandle<HTMLButtonElement>).click();
      }
    }
  }
}
