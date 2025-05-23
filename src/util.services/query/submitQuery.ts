import { Page } from 'rebrowser-puppeteer';
import { clickBtn, clickShadowBtn, waitForSelector } from '../../util/helpers';

import { Query } from '../../types/query';
import { get } from 'underscore';
import { get as lodashGet } from 'lodash';
import { QueryAction } from '../../types/queryActions';
import { WaitUntil } from '../../types/shop';

export async function submitQuery(
  page: Page,
  queryActions: QueryAction[],
  waitUntil: WaitUntil,
  query: Query,
) {
  if (!queryActions.length) return;

  for (const action of queryActions) {
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
        if (!selector) {
          continue;
        }
      }
    }
    if (
      'what' in action &&
      typeof action.what === 'string' &&
      action.what.length
    ) {
      if (action.wait) {
        await Promise.all([
          page.waitForNavigation({
            waitUntil: waitUntil ? waitUntil.product : 'networkidle2',
          }),
          await selector
            .select(lodashGet(query, action.what, '') as string)
            .catch((e) => {
              console.log(e);
            }),
        ]);
      } else {
        await selector
          .select(lodashGet(query, action.what, '') as string)
          .catch((e) => {
            console.log(e);
          });
      }
    }
    if ('what' in action && Array.isArray(action.what)) {
      const year = action.what.some((what) => what.startsWith('year'));
      if (year) {
        const split = action.what[0].split('.');
        const year = get(query, split) as Number;
        if (year !== 0) {
          await Promise.all([
            page.waitForNavigation(),
            selector.type(year.toString(), { delay: 50 }).catch((e) => {
              console.log(e);
            }),
          ]);
        }
      } else {
        let _query = action.what
          .map((key) => lodashGet(query, action.what, '') as string)
          .join(' ');

        if (action.wait) {
          await Promise.all([
            page.waitForNavigation({
              waitUntil: waitUntil ? waitUntil.product : 'networkidle2',
            }),
            await selector.type(_query, { delay: 50 }).catch((e) => {
              console.log(e);
            }),
          ]);
        } else {
          await selector.type(_query, { delay: 50 }).catch((e) => {
            console.log(e);
          });
        }
      }
    }
  }
}
