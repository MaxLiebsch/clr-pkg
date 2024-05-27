import { ElementHandle, Page } from 'puppeteer1';
import { Limit, SubCategoriesSel } from '../../types';
import { waitForSelector } from '../helpers';

const findSubCategories = async (
  page: Page,
  subCategories: SubCategoriesSel[],
  limit?: Limit,
) => {
  if (!subCategories.length || limit?.pages === 0)
    return {
      subCategoryHandle: 'missing',
      subCategory: {} as SubCategoriesSel,
    };
  let subCategoryHandle:
    | ElementHandle<Element>
    | 'missing'
    | null
    | undefined
    | boolean;
  let subCategory = subCategories[0];

  for (let index = 0; index < subCategories.length; index++) {
    subCategory = subCategories[index];
    const { sel, visible } = subCategory;

    subCategoryHandle = sel ? await waitForSelector(page, sel,5000, visible) : 'missing';

    if (subCategoryHandle !== 'missing' && subCategoryHandle) break;
  }
  return { subCategoryHandle, subCategory };
};

export default findSubCategories;
