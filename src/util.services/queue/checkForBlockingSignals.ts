import { Page } from 'rebrowser-puppeteer';
import { contentMissing, slug } from '../../util/helpers';
import { join } from 'path';
import { LoggerService } from '../../util/logger';
import { QueueTask } from '../../types/QueueTask';
import { hostname } from 'os';

const defaultDetection = ['access denied', 'spamschutz', 'spam-schutz'];

export async function checkForBlockingSignals(
  page: Page,
  log: boolean = false,
  mimic?: string,
  link?: string,
  task?: QueueTask,
) {
  let extendedCheck = true;
  if (mimic) {
    if (mimic.endsWith(';')) {
      extendedCheck = false;
      mimic = mimic.slice(0, -1);
    }
    const isMissing = await contentMissing(page, mimic);
    if (isMissing) {
      if (log) {
        if (task) {
          LoggerService.getSingleton().logger.info({
            location: `Check for Mimic`,
            msg: 'isBlocked',
            hostname: hostname(),
            type: task.type,
            link,
            typeId: task.id,
            shopDomain: task.shopDomain,
          });
        } else {
          LoggerService.getSingleton().logger.info({
            location: `Check for Mimic`,
            msg: 'isBlocked',
            hostname: hostname(),
          });
        }
      }

      if (process.env.DEBUG === 'true') {
        await page
          .screenshot({
            type: 'png',
            path: join(
              process.cwd(),
              `/data/shop/debug/blocked.${task?.shopDomain ?? slug(page.url())}.png`,
            ),
            fullPage: true,
          })
          .catch((e) => {});
      }
      return true;
    }
  }

  if (!extendedCheck) return false;
  const pageContent = await page.content().catch((e) => {});

  const isBlocked = defaultDetection.some((detection) =>
    (pageContent ?? '').toLowerCase().includes(detection),
  );

  if (isBlocked) {
    if (task)
      LoggerService.getSingleton().logger.info({
        location: `BlockedBlock`,
        link,
        msg: 'isBlocked',
        isBlocked,
        hostname: hostname(),
        type: task.type,
        typeId: task.id,
        shopDomain: task.shopDomain,
      });
    else
      LoggerService.getSingleton().logger.info({
        location: `BlockedBlock`,
        msg: 'isBlocked',
        isBlocked,
        link,
        hostname: hostname(),
      });
    if (process.env.DEBUG == 'true') {
      await page
        .screenshot({
          type: 'png',
          path: join(
            process.cwd(),
            `/data/shop/debug/blocked.${slug(page.url())}.png`,
          ),
          fullPage: true,
        })
        .catch((e) => {});
    }
    return true;
  }

  return false;
}
