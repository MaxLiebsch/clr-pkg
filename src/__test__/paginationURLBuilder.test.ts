import { describe, expect, test } from '@jest/globals';
import { paginationUrlBuilder } from '../util/crawl/paginationURLBuilder';

describe('sum module', () => {
  test('reichelt.de generate page 3', () => {
    expect(
      paginationUrlBuilder(
        'https://www.reichelt.de/headsets-c9845.html',
        [
          {
            type: 'pagination',
            sel: 'div.div.PageLinksNavi',
            nav: '.html?ACTION=2&GROUPID=<groupid>&START=<page>&OFFSET=30&nbc=1',
            scrollToBottom: true,
            paginationUrlSchema: {
              replace: '\\.html',
              parseAndReplace: { regexp: '\\d+', replace: '<groupid>' },
              withQuery: false,
              calculation: {
                method: 'offset',
                offset: 30,
              },
            },
            calculation: {
              method: 'count',
              last: 'div.PageLinksNavi button:is(.SiteLinks,.SiteLinksDouble)',
              sel: 'div.PageLinksNavi button:is(.SiteLinks,.SiteLinksDouble)',
            },
          },
        ],
        3,
      ),
    ).toBe(
      'https://www.reichelt.de/headsets-c9845.html?ACTION=2&GROUPID=9845&START=60&OFFSET=30&nbc=1',
    );
  });
  test('otto.de generate page 5', () => {
    expect(
      paginationUrlBuilder(
        'https://www.otto.de/herren/mode/waesche/unterhosen/boxershorts/',
        [
            {
              type: "pagination",
              sel: "ul.reptile_paging.reptile_paging--bottom",
              nav: "?l=gp&o=<page>",
              scrollToBottom: true,
              paginationUrlSchema: {
                replace: "attach_end",
                withQuery: false,
                calculation: {
                  method: "offset",
                  offset: 120,
                },
              },
              calculation: {
                method: "count",
                last: "ul.reptile_paging.reptile_paging--bottom button",
                sel: "ul.reptile_paging.reptile_paging--bottom button",
              },
            },
          ],
        5,
      ),
    ).toBe(
      'https://www.otto.de/herren/mode/waesche/unterhosen/boxershorts/?l=gp&o=480',
    );
  });
});
