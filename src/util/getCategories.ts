import { Page } from 'puppeteer';
import { Categories } from '../types';
import {
  extractCategoryNameAndCapitalize,
  getElementHandleAttribute2,
  getElementHandleInnerText,
  makeSuitableObjectKey,
  myQuerySelectorAll,
  waitForSelector,
} from './helpers';
import {
  linkPassedCategoryNameShopCriteria,
  linkPassedURLShopCriteria,
  removeRandomKeywordInURL,
} from './sanitize';
import { CrawlerQueue } from './queue';
import { prefixLink } from './compare_helper';

export interface ICategory {
  name: string;
  link: string;
  entryCategory?: string;
}

export const getCategories = async (
  page: Page,
  categorieEls: Categories,
  queue: CrawlerQueue,
  domain: string,
  ece: string[] = [],
  sub: boolean = false,
) => {
  const categorieLinks: ICategory[] = [];
  const { sel, type } = sub ? categorieEls.subCategories : categorieEls;
  const handle = await waitForSelector(
    page,
    sel,
    categorieEls.wait ?? 5000,
    categorieEls.visible,
  );

  if (handle !== 'missing' && handle) {
    const categories = await myQuerySelectorAll(page, sel);
    if (categories !== 'missing' && categories) {
      for (let index = 0; index < categories.length; index++) {
        const categoryLink = await getElementHandleAttribute2(
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
            categorieEls.categoryRegexp
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
