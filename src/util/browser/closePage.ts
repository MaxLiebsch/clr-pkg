import { Page } from 'rebrowser-puppeteer';

export const closePage = async (page: Page) => {
  try {
    if(process.env.KEEP_BROWSER_OPEN === 'true') return;
    if (!page.isClosed()) await page.close();
  } catch (error) {
    if (error instanceof Error) console.log('closePage:\n', error.message);
  }
};
