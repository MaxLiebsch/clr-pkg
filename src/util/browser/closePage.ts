import { Page } from 'puppeteer1'

export const closePage = async (page: Page) => {
  
  try {
    !page.isClosed() && page && (await page.close());
  } catch (error) {
    if (error instanceof Error) console.log('closePage:\n', error.message);
  }
};
