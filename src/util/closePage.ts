import { Page } from 'puppeteer';

export const closePage = async (page: Page) => {
  try {
    // const context = page.browserContext();
    // await context.close();
    !page.isClosed() && (await page.close());
  } catch (error) {
    if (error instanceof Error) console.log('closePage:\n', error.message);
  }
};
