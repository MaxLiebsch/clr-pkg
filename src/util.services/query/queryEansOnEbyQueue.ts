import { Page } from 'puppeteer1';
import { browseProductpages } from '../../util/crawl/browseProductPages';
import { submitQuery } from './submitQuery';
import { QueryRequest } from '../../types/query-request';
import { getInnerText } from '../../util/helpers';
import { MAX_RETRIES_LOOKUP_EAN, ebyNotFoundText } from '../../constants';

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
    targetShop,
    limit,
    retries,
  } = request;
  const { queryActions, waitUntil } = shop;

  const { value: ean } = query.product;

  await submitQuery(page, queryActions, waitUntil, query);

  const notFound = await getInnerText(page, 'h3.srp-save-null-search__heading');
  if (notFound?.includes(ebyNotFoundText)) {
    onNotFound && (await onNotFound());
    return `${targetShop?.name} - ${ean} not found on Eby`;
  }

  const res = await browseProductpages(
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
