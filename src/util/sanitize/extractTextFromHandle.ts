import { ElementHandle } from 'puppeteer';

export const extractTextFromHandle = async (
  sel: string,
  elementHandle: ElementHandle,
) => {
  return elementHandle
    .$eval(sel, (i) => {
      const innerText = (i as HTMLElement).innerText.trim();
      if (innerText !== '') {
        return innerText;
      } else {
        const innerHTML = (i as HTMLElement).innerHTML;
        return innerHTML;
      }
    })
    .catch((e) => {});
};
