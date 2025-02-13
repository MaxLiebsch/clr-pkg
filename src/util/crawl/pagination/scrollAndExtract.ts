import { Page } from 'rebrowser-puppeteer';
import { clickBtn, humanScroll, waitForSelector } from '../../helpers';
import { Shop, WaitUntil } from '../../../types/shop';
import { crawlProducts } from '../crawlProducts';
import { ICategory } from '../getCategories';
import { ProductRecord } from '../../../types/DbProductRecord';
import { PaginationElement } from '../../../types/paginationElement';

const debug = process.env.DEBUG === 'true';

interface ScrollAndExtratProps {
  page: Page;
  productContainerSelector: string;
  limit: number;
  wait?: boolean;
  waitUntil: WaitUntil;
  paginationEl: PaginationElement;
  shop: Shop;
  pageInfo: ICategory;
  expect?: any;
  addProduct: (product: ProductRecord) => Promise<void>;
}

export async function scrollAndExtract({
  limit,
  page,
  productContainerSelector,
  paginationEl,
  wait,
  waitUntil,
  shop,
  addProduct,
  pageInfo,
}: ScrollAndExtratProps) {
  let cnt = 0;

  const {
    sel: paginationBtnSelector,
    timeoutAfterBtnClick,
    activeSearchLoadSel,
  } = paginationEl;

  const availableWindow = await availableWindowHeight(page);

  if (availableWindow === 0) {
    debug && console.error('failed to retrieve Window height');
    return null;
  }
  debug && console.log('availableWindow:', availableWindow);

  const relativePosition = await getRelativePositionProductContainer(
    page,
    productContainerSelector,
  );

  if (!relativePosition) {
    debug && console.error('failed to retrieve relativePostion');
    return null;
  }
  debug && console.log('relativePosition:', relativePosition);

  let startPostion = relativePosition.top;
  let endPosition = relativePosition.bottom - availableWindow / 2; //to end position for scrolling is above the end of the actuall container

  // scroll to start
  await scrollToPosition(page, startPostion);

  let nextScrollPositon = Math.floor(startPostion + availableWindow);

  do {
    cnt++;
    debug && console.log('nextScrollPositon:', nextScrollPositon, 'cnt:', cnt);

    const btn = await waitForSelector(page, paginationBtnSelector, 500, false);
    if (btn) {
      debug && console.log('btn exists');
      await clickBtn(
        page,
        paginationBtnSelector,
        wait ?? false,
        waitUntil,
        timeoutAfterBtnClick || 500,
      );
      //if activeSearchLoadSel is present, wait for it to disappear
      if (activeSearchLoadSel) {
        await page.waitForSelector(activeSearchLoadSel, { hidden: true });
      }

      const relativePosition = await getRelativePositionProductContainer(
        page,
        productContainerSelector,
      );
      if (relativePosition) {
        endPosition = relativePosition?.bottom - availableWindow / 2;
        debug && console.log('New EndPosition:', endPosition);
      }
    }
    await crawlProducts(page, shop, addProduct, pageInfo, 1);
    await scrollToPosition(page, nextScrollPositon);
    const currentScrollPosition = await retrieveCurrScrollPostion(page);
    nextScrollPositon = Math.floor(currentScrollPosition + availableWindow * 2);
  } while (cnt <= limit * 2 && nextScrollPositon <= endPosition);

  return { cnt };
}

// current scrollposition
export async function retrieveCurrScrollPostion(page: Page) {
  return page.evaluate(() => window.scrollY).catch() || 0;
}

// available window height screen - menu
export async function availableWindowHeight(page: Page) {
  return page.evaluate(() => window.innerHeight).catch() || 0;
}

export async function heightProductItem(page: Page, productSelector: string) {
  return page
    .evaluate((productSelector) => {
      return document.querySelector(productSelector)?.clientHeight || null;
    }, productSelector)
    .catch();
}

export async function getRelativePositionProductContainer(
  page: Page,
  sel: string,
) {
  const element = await waitForSelector(page, sel, 500, false);

  if (!element) {
    return null;
  }

  const scrollTop = await page
    .evaluate(() => document.documentElement.scrollTop)
    .catch();

  if (scrollTop === undefined) return null;

  const boundingClientRectTop = await page
    .evaluate((sel) => {
      const elem = document.querySelector(sel);

      if (!elem) return null;
      return elem.getBoundingClientRect().top;
    }, sel)
    .catch();

  const boundingClientRectBottom = await page
    .evaluate((sel) => {
      const elem = document.querySelector(sel);

      if (!elem) return null;
      return elem.getBoundingClientRect().bottom;
    }, sel)
    .catch();

  if (!boundingClientRectBottom || !boundingClientRectTop) return null;

  return {
    top: Math.floor(boundingClientRectTop + scrollTop),
    bottom: Math.floor(boundingClientRectBottom + scrollTop),
  };
}

export async function scrollToPosition(page: Page, newScrollPosition: number) {
  await page
    .evaluate((newScrollPosition: number) => {
      window.scrollTo(0, newScrollPosition);
    }, newScrollPosition)
    .catch();
}
