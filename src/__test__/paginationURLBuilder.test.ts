import { describe, expect, test } from '@jest/globals';
import { paginationUrlBuilder } from '../util/crawl/paginationURLBuilder';

describe('Pagination Builder', () => {
  // test('reichelt.de generate page 3', async () => {
  //   expect(
  //     await paginationUrlBuilder(
  //       'https://www.reichelt.de/de/de/index.html?ACTION=446&LA=102&GROUPID=5820&VIEWALL=1&search=specialprice&nbc=1',
  //       [
  //         {
  //           type: 'pagination',
  //           sel: 'div.div.PageLinksNavi',
  //           nav: '.html?ACTION=2&GROUPID=<groupid>&START=<page>&OFFSET=30&nbc=1',
  //           paginationUrlSchema: {
  //             replace: '\\.html',
  //             parseAndReplace: { regexp: '\\d+', replace: '<groupid>' },
  //             withQuery: false,
  //             calculation: {
  //               method: 'offset',
  //               offset: 30,
  //             },
  //           },
  //           calculation: {
  //             method: 'count',
  //             last: 'div.PageLinksNavi button:is(.SiteLinks,.SiteLinksDouble)',
  //             sel: 'div.PageLinksNavi button:is(.SiteLinks,.SiteLinksDouble)',
  //           },
  //         },
  //       ],
  //       3,
  //     ),
  //   ).toBe(
  //     'https://www.reichelt.de/headsets-c9845.html?ACTION=2&GROUPID=9845&START=60&OFFSET=30&nbc=1',
  //   );
  // });
  // test('otto.de generate page 5', () => {
  //   expect(
  //     paginationUrlBuilder(
  //       'https://www.otto.de/herren/mode/waesche/unterhosen/boxershorts/',
  //       [
  //         {
  //           type: 'pagination',
  //           sel: 'ul.reptile_paging.reptile_paging--bottom',
  //           nav: '?l=gp&o=<page>',
  //           paginationUrlSchema: {
  //             replace: 'attach_end',
  //             withQuery: false,
  //             calculation: {
  //               method: 'offset',
  //               offset: 120,
  //             },
  //           },
  //           calculation: {
  //             method: 'count',
  //             last: 'ul.reptile_paging.reptile_paging--bottom button',
  //             sel: 'ul.reptile_paging.reptile_paging--bottom button',
  //           },
  //         },
  //       ],
  //       5,
  //     ),
  //   ).toBe(
  //     'https://www.otto.de/herren/mode/waesche/unterhosen/boxershorts/?l=gp&o=480',
  //   );
  // });

  test('gameshop generate page 2', async () => {
    expect(
      await paginationUrlBuilder(
        'https://www.gamestop.de/SearchResult/Quicksearch?platform=68&productType=2',
        [
          {
            type: 'pagination',
            sel: 'button.button-secondary.loadmoreBtn',
            nav: '&typesorting=0&sdirection=ascending&skippos=<skip>&takenum=24',
            paginationUrlSchema: {
              replace: '',
              withQuery: false,
              calculation: {
                method: 'replace_append',
                replace: [
                  {
                    search: '<skip>',
                    skip: 24,
                    use: 'skip',
                  },
                  {
                    search: 'Quicksearch',
                    replace: 'QuicksearchAjax',
                  },
                ],
                offset: 0
              },
            },
            calculation: {
              method: 'match_text',
              textToMatch: 'Weitere Artikel laden',
              dynamic: true,
              last: 'button.button-secondary.loadmoreBtn',
              sel: 'button.button-secondary.loadmoreBtn',
            },
          },
        ],
        2,  
        null,
      ),
    ).toBe(
      'https://www.gamestop.de/SearchResult/QuicksearchAjax?platform=68&productType=2&typesorting=0&sdirection=ascending&skippos=48&takenum=24',
    );
  });
});
