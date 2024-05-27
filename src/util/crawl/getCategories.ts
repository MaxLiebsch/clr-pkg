import { Page } from 'puppeteer1';
import { Categories } from '../../types';
import {
  extractCategoryNameAndCapitalize,
  getElementHandleAttribute2,
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
import { CrawlerRequest } from '../../types/query-request';

export interface ICategory {
  name: string;
  link: string;
  entryCategory?: string;
}

export const getCategories = async (
  page: Page,
  request: CrawlerRequest,
  sub: boolean = false,
) => {
  const { queue, shop } = request;
  const { categories: categorieEls, d: domain, ece } = shop;
  const categorieLinks: ICategory[] = [];
  if (sub) {
    const subCategories = categorieEls.subCategories;
    const { subCategoryHandle, subCategory } = await findSubCategories(
      page,
      subCategories,
    );
    if (subCategoryHandle !== 'missing' && subCategoryHandle) {
      const { sel, type } = subCategory;
      const categories = await myQuerySelectorAll(page, sel);
      if (categories !== 'missing' && categories) {
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
          const categoryLink = await getElementHandleAttribute2(
            categories[index],
            type,
          );
          const categoryName = await getElementHandleInnerText(
            categories[index],
          );
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
    }
  } else {
    const { sel, type } = categorieEls;
    const handle = await waitForSelector(
      page,
      sel,
      categorieEls.wait ?? 5000,
      categorieEls.visible,
    );

    if (handle !== 'missing' && handle) {
      const categories = await myQuerySelectorAll(page, sel);
      if (categories !== 'missing' && categories) {
        request.categoriesHeuristic.mainCategories = categories.length;
        for (let index = 0; index < categories.length; index++) {
          const categoryLink = await getElementHandleAttribute2(
            categories[index],
            type,
          );
          const categoryName = await getElementHandleInnerText(
            categories[index],
          );
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
    }
  }
};

const testAndPushUrl = (
  queue: CrawlerQueue,
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
