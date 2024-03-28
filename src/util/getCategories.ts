import { Page } from 'puppeteer';
import { Categories } from '../types';
import {
  getElementHandleAttribute2,
  getElementHandleInnerText,
  makeSuitableObjectKey,
  myQuerySelectorAll,
  waitForSelector,
} from './helpers';
import { linkPassedURLShopCriteria } from './sanitize';
import { CrawlerQueue } from './queue';
import { prefixLink } from './compare_helper';

export interface ICategory {
  name: string;
  link: string;
}
//TODO: Make sure you only add subpages that are not already in the list

export const getCategories = async (
  page: Page,
  categorieEls: Categories,
  queue: CrawlerQueue,
  domain: string,
  sub: boolean = false,
) => {
  const categorieLinks: ICategory[] = [];
  const { sel, type } = sub ? categorieEls.subCategories : categorieEls;
  const handle = await waitForSelector(page, sel);

  if (handle !== 'missing' && handle) {
    const categories = await myQuerySelectorAll(page, sel);
    if (categories !== 'missing' && categories) {
      for (let index = 0; index < categories.length; index++) {
        const categorylink = await getElementHandleAttribute2(
          categories[index],
          type,
        );
        const categoryName = await getElementHandleInnerText(categories[index]); 
        if (categorylink && categoryName && new RegExp(/\w/g).test(categoryName)) {
          const exclude = categorieEls?.exclude ? categorieEls.exclude : [];
          const completeLink = prefixLink(categorylink, domain);
          const categoryLinkExists = queue.doesCategoryLinkExist(completeLink);
          if (!categoryLinkExists) {
            queue.addCategoryLink(completeLink);
            if (linkPassedURLShopCriteria(completeLink, exclude)) {
              categorieLinks.push({
                name: categoryName ? makeSuitableObjectKey(categoryName) : 'Kategorie-fehlt',
                link: completeLink,
              });
            }
          }
        }
      }
      return categorieLinks;
    }
  }
};
