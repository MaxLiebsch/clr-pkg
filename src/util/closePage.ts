import { Page } from 'puppeteer';

export const closePage = async (page: Page) => {
  try {
    !page.isClosed() && (await page.close());
  } catch (error) {
    if (error instanceof Error) console.log('closePage:\n', error.message);
  }
};
