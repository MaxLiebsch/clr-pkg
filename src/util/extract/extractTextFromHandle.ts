import { ElementHandle } from 'rebrowser-puppeteer';

export const extractTextFromElementHandle = async (
  elementHandle: ElementHandle,
  sel: string,
) => {
  try {
    const text = await elementHandle.$eval(sel, (i) => {
      const innerText = (i as HTMLElement).innerText.trim();
      if (innerText) return innerText;

      const innerHTML = (i as HTMLElement).innerHTML;
      if (innerHTML) return innerHTML;

      return null;
    });
    return text;
  } catch (error) {
    return null;
  }
};
