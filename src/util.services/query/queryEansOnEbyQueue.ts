import { Page } from 'rebrowser-puppeteer';
import { browseProductPages } from '../../util/crawl/browseProductPages';
import { submitQuery } from './submitQuery';
import { QueryRequest } from '../../types/query-request';
import { getInnerText } from '../../util/helpers';
import { ebyNotFoundText, MAX_RETRIES_LOOKUP_EAN } from '../../constants';
import { closePage } from '../../util/browser/closePage';
import { ErrorType } from '../queue/ErrorTypes';

export const queryEansOnEbyQueue = async (
  page: Page,
  request: QueryRequest,
) => {
  const {
    shop,
    query,
    pageInfo,
    addProduct,
    onNotFound,
    isFinished,
    limit,
    retries,
  } = request;
  const { queryActions, waitUntil } = shop;

  await submitQuery(page, queryActions || [], waitUntil, query);

  const notFound = await getInnerText(page, 'h3.srp-save-null-search__heading');
  if (notFound?.includes(ebyNotFoundText)) {
    if (retries < MAX_RETRIES_LOOKUP_EAN) {
      throw new Error(ErrorType.EanOnEbyNotFound);
    } else {
      onNotFound && (await onNotFound('notFound'));
    }
    await closePage(page);
    return;
  }

  const res = await browseProductPages(
    page,
    shop,
    addProduct,
    pageInfo,
    limit,
    query,
  );

  if (res === 'crawled') {
    isFinished && isFinished();
  }
};
