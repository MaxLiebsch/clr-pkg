import { Page } from 'rebrowser-puppeteer';
import {
  extractCategoryNameAndCapitalize,
  getElementHandleInnerText,
  makeSuitableObjectKey,
  myQuerySelectorAll,
  waitForSelector,
} from '../helpers';
import {
  linkPassedCategoryNameShopCriteria,
  linkPassedURLShopCriteria,
  removeRandomKeywordInURL,
} from '../sanitize';
import { CrawlerQueue } from '../../util.services/queue/CrawlerQueue';
import { prefixLink } from '../matching/compare_helper';
import findSubCategories from './findSubCategories';
import { ScrapeRequest, ScanRequest } from '../../types/query-request';
import { ScanQueue } from '../../util.services/queue/ScanQueue';
import { extractAttributeElementHandle } from '../extract/extractAttributeFromHandle';

const debug = process.env.DEBUG === 'true';

export interface ICategory {
  name: string;
  link: string;
  skipSubCategories?: boolean;
  scrapeCurrentPageProducts?: boolean;
  entryCategory?: string;
}

export const getCategories = async (
  page: Page,
  request: ScrapeRequest | ScanRequest,
  sub: boolean = false,
) => {
  const { queue, shop, pageInfo } = request;
  const { categories: categorieEls, d: domain, ece } = shop;
  const categorieLinks: ICategory[] = [];
  if (sub) {
    if (pageInfo?.skipSubCategories) {
      debug && console.log('Skipping subcategories');
      return null;
    }
    const subCategories = categorieEls.subCategories;
    const { subCategoryHandle, subCategory } = await findSubCategories(
      page,
      subCategories,
    );
    if (!subCategoryHandle) return null;

    const { sel, type } = subCategory;
    const categories = await myQuerySelectorAll(page, sel);
    if (!categories) return null;
    switch (true) {
      case categories.length === 0:
        request.categoriesHeuristic.subCategories['0'] += 1;
        break;
      case categories.length >= 0 && categories.length < 10:
        request.categoriesHeuristic.subCategories['1-9'] += 1;
        break;
      case categories.length >= 10 && categories.length < 20:
        request.categoriesHeuristic.subCategories['10-19'] += 1;
        break;
      case categories.length >= 20 && categories.length < 30:
        request.categoriesHeuristic.subCategories['20-29'] += 1;
        break;
      case categories.length >= 30 && categories.length < 40:
        request.categoriesHeuristic.subCategories['30-39'] += 1;
        break;
      case categories.length >= 40 && categories.length < 50:
        request.categoriesHeuristic.subCategories['40-49'] += 1;
        break;
      case categories.length >= 50:
        request.categoriesHeuristic.subCategories['+50'] += 1;
        break;
    }

    for (let index = 0; index < categories.length; index++) {
      const categoryHandle = categories[index];
      const categoryLink = await extractAttributeElementHandle(
        categoryHandle,
        type,
      );
      const categoryName = await getElementHandleInnerText(categoryHandle);
      if (
        categoryLink &&
        categoryName &&
        new RegExp(/\w/g).test(categoryName)
      ) {
        testAndPushUrl(
          queue,
          categorieLinks,
          categoryLink,
          categoryName,
          domain,
          ece,
          categorieEls?.exclude,
        );
      } else if (categoryLink) {
        const categoryNameSegmentPos =
          typeof categorieEls?.categoryNameSegmentPos === 'number'
            ? categorieEls.categoryNameSegmentPos
            : 1;
        const categoryName = extractCategoryNameAndCapitalize(
          categoryLink,
          categoryNameSegmentPos,
          categorieEls?.categoryRegexp,
          categorieEls?.regexpMatchIndex,
        );
        if (categoryName) {
          testAndPushUrl(
            queue,
            categorieLinks,
            categoryLink,
            categoryName,
            domain,
            ece,
            categorieEls?.exclude,
          );
        }
      }
    }
    return categorieLinks;
  } else {
    const { sel, type, visible, wait } = categorieEls;
    const handle = await waitForSelector(page, sel, wait ?? 5000, visible);
    if (!handle) return null;

    const categories = await myQuerySelectorAll(page, sel);
    if (!categories) return null;

    request.categoriesHeuristic.mainCategories = categories.length;
    for (let index = 0; index < categories.length; index++) {
      const categoryLink = await extractAttributeElementHandle(
        categories[index],
        type,
      );
      const categoryName = await getElementHandleInnerText(categories[index]);
      if (
        categoryLink &&
        categoryName &&
        new RegExp(/\w/g).test(categoryName)
      ) {
        testAndPushUrl(
          queue,
          categorieLinks,
          categoryLink,
          categoryName,
          domain,
          ece,
          categorieEls?.exclude,
        );
      } else if (categoryLink) {
        const categoryName = extractCategoryNameAndCapitalize(
          categoryLink,
          categorieEls.categoryNameSegmentPos ?? 1,
          categorieEls.categoryRegexp,
        );
        if (categoryName) {
          testAndPushUrl(
            queue,
            categorieLinks,
            categoryLink,
            categoryName,
            domain,
            ece,
            categorieEls?.exclude,
          );
        }
      }
    }
    return categorieLinks;
  }
};

const testAndPushUrl = (
  queue: CrawlerQueue | ScanQueue,
  categorieLinks: ICategory[],
  categoryLink: string,
  categoryName: string,
  domain: string,
  urlPartsToBeEscaped: string[] = [],
  _exclude?: string[],
) => {
  const exclude = _exclude ? _exclude : [];
  const completeLink = prefixLink(categoryLink, domain);
  const categoryLinkExists = queue.doesCategoryLinkExist(completeLink);
  if (!categoryLinkExists) {
    queue.addCategoryLink(completeLink);
    if (
      linkPassedURLShopCriteria(completeLink, exclude) &&
      linkPassedCategoryNameShopCriteria(categoryName, exclude)
    ) {
      categorieLinks.push({
        name: categoryName
          ? makeSuitableObjectKey(categoryName)
          : 'Kategorie-fehlt',
        link: removeRandomKeywordInURL(completeLink, urlPartsToBeEscaped),
      });
    }
  }
};
