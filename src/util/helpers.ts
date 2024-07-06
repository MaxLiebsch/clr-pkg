import { ElementHandle, Page, TimeoutError } from 'puppeteer1';
import { BrowserGroup, BrowserInfo, ChildProcessInfo } from '../types/index';
import { getNumber } from '../util/matching/compare_helper';
import { load } from 'cheerio';

import { NestedNameDetail } from '../types/productInfoDetails';
import { ProductList } from '../types/productList';
import { WaitUntil } from '../types/shop';

export const browserLoadChecker = (browserGroup: BrowserGroup): BrowserInfo =>
  Object.keys(browserGroup).reduce(
    (min, key) => (browserGroup[key].load < min.load ? browserGroup[key] : min),
    browserGroup[Object.keys(browserGroup)[0]],
  );

export function makeSuitableObjectKey(string: string) {
  // Replace characters that are not allowed in object property keys with an underscore
  return string
    .replace(/[\s+]/g, ' ')
    .replace(/[.]/g, '')
    .replace(/[\\/]/g, ' ');
}

export const getAFreeProcess = (browserGroup: {
  [key: string]: ChildProcessInfo;
}) => {
  return Object.keys(browserGroup).reduce(
    (min, pid) => (browserGroup[pid].load < min.load ? browserGroup[pid] : min),
    browserGroup[Object.keys(browserGroup)[0]],
  );
};

export async function filter(arr: any[], callback: Function) {
  return (
    await Promise.all(
      arr.map(async (item) => ((await callback(item)) ? item : false)),
    )
  ).filter((i) => i !== false);
}

//Puppeteer

/*                 Selector                       */

export const myQuerySelectorAll = async (page: Page, sel: string) => {
  try {
    const elements = await page.$$(sel);
    if (elements.length) return elements;
    return null;
  } catch (error) {
    return null;
  }
};

export const myQuerySelectorAllElementHandle = async (
  elementHandle: ElementHandle,
  sel: string,
) => {
  try {
    const elements = await elementHandle.$$(sel);
    if (elements.length) return elements;
    return null;
  } catch (error) {
    return null;
  }
};

export const myQuerySelectorAll2 = async (page: Page, sel: string) =>
  page
    .evaluate((sel) => {
      return document.querySelectorAll(sel);
    }, sel)
    .catch((e) => {
      if (e instanceof TimeoutError) {
        return 'missing';
      }
    });

export const shadowRootSelector = async (page: Page, sel: string) => {
  try {
    const shadowRoot = await page.evaluateHandle((sel) => {
      // Find the element hosting the shadow root
      const hostElement = document.querySelector(sel);

      // Access the shadow root
      if (!hostElement) return null;
      const shadowRoot = hostElement.shadowRoot;

      // Find the input element within the shadow root
      if (!shadowRoot) return null;
      return shadowRoot;

      // Set the value of the input element7
    }, sel);
    return shadowRoot;
  } catch (error) {
    return null;
  }
};

export function extractPart(str: string, pattern: string, part: number) {
  const regex = new RegExp(pattern);
  const match = str.match(regex);
  if (match && match[part]) {
    return match[part];
  } else {
    return '';
  }
}

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function extractCategoryNameAndCapitalize(
  url: string,
  segmentIndex: number,
  categoryRegexp?: string,
): string {
  try {
    if (categoryRegexp) {
      return capitalizeWords(
        extractPart(url, categoryRegexp, 1).replace(/[-]/, ' '),
      );
    }
    const urlObj = new URL(url);

    const segments = urlObj.pathname.split('/').filter(Boolean); // filter(Boolean) removes any empty strings from the array

    let segment = segments[segmentIndex];

    if (!segment) {
      throw new Error('Segment does not exist at the provided index.');
    }

    return (
      segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll(/[-]/g, ' ')
    );
  } catch (error) {
    return '';
  }
}

export const getProductCount = async (
  page: Page,
  productList: ProductList[],
) => {
  if (productList.length) {
    const { productCntSel, productsPerPage, awaitProductCntSel } =
      productList[0];
    if (productCntSel.length) {
      if (awaitProductCntSel) {
        for (let index = 0; index < productCntSel.length; index++) {
          const selector = productCntSel[index];
          const handle = await waitForSelector(page, selector, 5000, false);

          if (!handle) continue;

          const productCnt = await getElementHandleInnerText(handle);
          if (productCnt) {
            const cnt = getNumber(productCnt);
            if (productsPerPage && cnt) {
              return cnt * productsPerPage;
            } else {
              return cnt;
            }
          }
        }
      } else {
        for (let index = 0; index < productCntSel.length; index++) {
          const selector = productCntSel[index];
          const productCnt = await getInnerText(page, selector);
          if (productCnt) {
            const cnt = getNumber(productCnt);
            if (productsPerPage && cnt) {
              return cnt * productsPerPage;
            } else {
              return cnt;
            }
          }
        }
      }
    }
  }
  return 0;
};
/*                 Button                        */
export const clickBtn = async (
  page: Page,
  sel: string,
  wait: boolean,
  waitUntil: WaitUntil,
  waitDuration?: number,
) => {
  const isClickable = await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return (
      element &&
      element.getBoundingClientRect().width > 0 &&
      element.getBoundingClientRect().height > 0
    );
  }, sel);

  if (isClickable) {
    if (wait) {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: waitUntil ? waitUntil.product : 'networkidle2',
        }),
        page.click(sel).catch((e) => {}),
      ]);
    } else {
      await page.click(sel).catch((e) => {});
      if (waitDuration) {
        await new Promise((r) => setTimeout(r, waitDuration));
      }
    }
  } else {
    await page
      .evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element !== null) {
          (element as HTMLButtonElement).click();
        }
      }, sel)
      .catch((e) => console.log('evaluate button', e.message));
  }
};

export const clickElementInShadowRoot = async (
  elementHandle: ElementHandle,
  btn_sel: string,
) => {
  return elementHandle
    .evaluate((sel, btn_sel) => {
      if (sel.shadowRoot) {
        const btn = sel.shadowRoot.querySelector(btn_sel) as HTMLButtonElement;
        if (btn) {
          btn.click();
        }
      }
    }, btn_sel)
    .catch((e) => console.log(e));
};

export const clickShadowBtn = async (
  page: Page,
  elementHandle: ElementHandle,
  btn_sel: string,
  wait: boolean,
  waitUntil: WaitUntil,
) => {
  if (wait) {
    await Promise.all([
      page
        .waitForNavigation({
          waitUntil: waitUntil ? waitUntil.product : 'networkidle2',
        })
        .catch((e) => {
          console.log(e);
        }),
      clickElementInShadowRoot(elementHandle, btn_sel),
    ]);
  } else {
    await clickElementInShadowRoot(elementHandle, btn_sel);
  }
};

export const getInnerText = async (page: Page, sel: string) => {
  try {
    const result = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        const innerText = (element as HTMLElement).innerText.trim();
        if (innerText !== '') {
          return innerText;
        } else {
          const innerHTML = (element as HTMLElement).innerHTML;
          return innerHTML;
        }
      } else {
        return null;
      }
    }, sel);

    if (result) {
      return cleanUpHTML(result);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const deleteElementFromPage = async (page: Page, sel: string) => {
  try {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.remove();
        return 'removed';
      } else {
        return null;
      }
    }, sel);
  } catch (error) {
    return null;
  }
};

export const getElementHandleInnerText = async (
  elementHandle: ElementHandle,
) => {
  const result = await elementHandle
    .evaluate((element) => {
      const innerText = (element as HTMLElement).innerText.trim();
      if (innerText !== '') {
        return innerText;
      } else {
        const innerHTML = (element as HTMLElement).innerHTML;
        return innerHTML;
      }
    })
    .catch((e) => {});
  if (typeof result === 'string') {
    return cleanUpHTML(result.trim());
  } else {
    return null;
  }
};

export const extractAttributeElementhandle = async (
  elementHandle: ElementHandle,
  type: string,
) => {
  try {
    const attribute = await elementHandle.evaluate((el, type) => {
      const attribute = el.getAttribute(type);
      return attribute ? el.getAttribute(type) : null;
    }, type);
    return attribute;
  } catch (error) {
    return null;
  }
};
export const extractAttributePage = async (
  page: Page,
  sel: string,
  type: string,
) => {
  try {
    const attribute = await page.evaluate(
      (sel, type) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        const attribute = element.getAttribute(type);
        return attribute;
      },
      sel,
      type,
    );
    return attribute;
  } catch (error) {
    return null;
  }
};

export function roundToTwoDecimals(num: number) {
  return Math.round(num * 100) / 100;
}

export const contentMissing = async (page: Page, mimic: string) => {
  try {
    return page.evaluate((mimic) => {
      return document.querySelector(mimic) === null;
    }, mimic);
  } catch (error) {
    return null;
  }
};

export function cleanUpHTML(html: string) {
  const $ = load(html);
  return $('body')
    .text()
    .replaceAll(/[ \n]+/g, ' ');
}

export const waitForSelector = async (
  page: Page,
  sel: string,
  timeout: number = 5000,
  visible: boolean = true,
): Promise<ElementHandle | null> => {
  try {
    const result = await page.waitForSelector(sel, {
      visible,
      timeout,
    });
    return result;
  } catch (error) {
    return null;
  }
};

export async function nestedProductName(
  elementHandle: ElementHandle,
  detail: NestedNameDetail,
) {
  const { sel, remove } = detail;
  return elementHandle
    .evaluate(
      (element, remove, sel) => {
        const productElement = element.querySelector(sel) as HTMLElement;
        if (!productElement) return 'no name';
        let brandText = '';
        const brand = productElement.querySelector(remove) as HTMLElement;
        if (brand) {
          brandText = `${brand.innerText.trim()} `;
          brand.remove();
        }
        const productName = productElement.innerText.trim();
        return `${brandText}${productName}`;
        // return 'false'
      },
      remove,
      sel,
    )
    .catch((e) => {});
}

export async function removeNestedElementAndReturnText(
  elementHandle: ElementHandle,
  detail: NestedNameDetail,
) {
  const { sel, remove } = detail;

  try {
    const result = await elementHandle.evaluate(
      (element, remove, sel) => {
        const productElement = element.querySelector(sel) as HTMLElement;
        if (!productElement) return null;
        const elementToBeRemoved = productElement.querySelector(
          remove,
        ) as HTMLElement;
        if (elementToBeRemoved) {
          elementToBeRemoved.remove();
        }
        return productElement.innerText.trim();
      },
      remove,
      sel,
    );
    return result;
  } catch (error) {
    return null;
  }
}

export async function scrollToBottom(page: Page) {
  let lastHeight = await page
    .evaluate('document.body.scrollHeight')
    .catch((e) => {});
  while (true) {
    await page
      .evaluate('window.scrollTo(0,document.body.scrollHeight)')
      .catch((e) => {});

    await new Promise((r) => setTimeout(r, 5000));

    let newHeight = await page
      .evaluate('document.body.scrollHeight')
      .catch((e) => {});
    if (newHeight === lastHeight) {
      break;
    }
    lastHeight = newHeight;
  }
  return 'finished';
}

export async function humanScroll(page: Page) {
  let lastScrollPosition = 0;
  let newScrollPosition = 0;
  const maxScrollPosition = await page
    .evaluate(() => document.body.scrollHeight)
    .catch((e) => {});

  while (newScrollPosition < (maxScrollPosition ?? 0)) {
    // Random scroll step: between 100 and 600 pixels
    let scrollStep = Math.floor(Math.random() * 800) + 100;

    newScrollPosition = lastScrollPosition + scrollStep;
    // Scroll to the new position
    await page
      .evaluate((newScrollPosition: number) => {
        window.scrollTo(0, newScrollPosition);
      }, newScrollPosition)
      .catch((e) => {});

    // Random pause: between 100 and 500 milliseconds
    let pause = Math.floor(Math.random() * 200) + 100;
    await new Promise((r) => setTimeout(r, pause));

    // Occasionally scroll up a little
    if (Math.random() < 0.1) {
      // 10% chance to scroll up a bit
      newScrollPosition -= scrollStep / 2; // Scroll up half the last scroll step
      await page
        .evaluate((newScrollPosition: number) => {
          window.scrollTo(0, newScrollPosition);
        }, newScrollPosition)
        .catch((e) => {});
      await new Promise((r) => setTimeout(r, pause));
    }

    lastScrollPosition = newScrollPosition;
  }
  return 'finished';
}

export const slug = function (str: string) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
  var to = 'aaaaaeeeeeiiiiooooouuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};
