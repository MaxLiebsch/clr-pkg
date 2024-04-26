import { Page } from 'puppeteer';
import { contentMissing, slug } from './util/helpers';
import { join } from 'path';
import { LoggerService } from './util/logger';
import { QueueTask } from './types/QueueTask';
import { hostname } from 'os';

export async function checkForBlockingSignals(
  page: Page,
  mimic?: string,
  link?: string,
  task?: QueueTask,
) {
  if (mimic) {
    const isMissing = await contentMissing(page, mimic);
    if (isMissing) {
      if (task)
        LoggerService.getSingleton().logger.info({
          location: `Check for Mimic`,
          msg: 'isBlocked',
          hostname: hostname(),
          type: task.type,
          link,
          typeId: task.id,
          shopDomain: task.shopDomain,
        });
      else
        LoggerService.getSingleton().logger.info({
          location: `Check for Mimic`,
          msg: 'isBlocked',
          hostname: hostname(),
        });

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
  }
  const pageContent = await page.content().catch((e) => {});

  const accessDenied = (pageContent ?? '')
    .toLowerCase()
    .includes('access denied');
  const spamdetection =
    (pageContent ?? '').toLowerCase().includes('spamschutz') ||
    (pageContent ?? '').toLowerCase().includes('spam-schutz');

  const isBlocked = accessDenied || spamdetection;

  if (isBlocked) {
    if (task)
      LoggerService.getSingleton().logger.info({
        location: `BlockedBlock`,
        link,
        msg: 'isBlocked',
        accessDenied,
        spamdetection,
        hostname: hostname(),
        type: task.type,
        typeId: task.id,
        shopDomain: task.shopDomain,
      });
    else
      LoggerService.getSingleton().logger.info({
        location: `BlockedBlock`,
        msg: 'isBlocked',
        link,
        accessDenied,
        spamdetection,
        hostname: hostname(),
      });
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
