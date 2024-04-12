import { Page } from 'puppeteer';
import { contentMissing, slug } from './util/helpers';
import { join } from 'path';

export async function checkForBlockingSignals(page: Page, mimic?: string) {
  if (mimic) {
    const isMissing = await contentMissing(page, mimic);
    if (isMissing) {
      if (process.env.DEBUG) {
        console.log('isMissing:', isMissing);
        await page
          .screenshot({
            type: 'png',
            path: join(
              process.cwd(),
              `/data/shop/debug/blocked.${slug(page.url())}.png`,
            ),
            fullPage: true,
          })
          .catch((e) => {
            console.log('e:', e);
          });
      }
      return true;
    }
  }
  const pageContent = await page.content().catch((e) => {});
  const isBlocked =
    // (pageContent ?? '').toLowerCase().includes('captcha') ||
    (pageContent ?? '').toLowerCase().includes('access denied') ||
    (pageContent ?? '').toLowerCase().includes('spamschutz') ||
    (pageContent ?? '').toLowerCase().includes('spam-schutz');

  if (isBlocked) {
    console.log('isBlocked:', isBlocked);
    if (process.env.DEBUG) {
      await page
        .screenshot({
          type: 'png',
          path: join(
            process.cwd(),
            `/data/shop/debug/blocked.${slug(page.url())}.png`,
          ),
          fullPage: true,
        })
        .catch((e) => {
          console.log('e:', e);
        });
    }
    return true;
  }

  return false;
}
