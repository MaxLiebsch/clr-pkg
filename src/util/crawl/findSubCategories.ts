import { ElementHandle, Page } from 'rebrowser-puppeteer';
import { Limit,} from '../../types';
import { waitForSelector } from '../helpers';
import { SubCategoriesSel } from '../../types/categories';

const findSubCategories = async (
  page: Page,
  subCategories: SubCategoriesSel[],
  limit?: Limit,
) => {
  if (!subCategories.length || limit?.pages === 0)
    return {
      subCategoryHandle: null,
      subCategory: {} as SubCategoriesSel,
    };
  let subCategoryHandle: ElementHandle<Element> | null = null;

  let subCategory = subCategories[0];

  for (let index = 0; index < subCategories.length; index++) {
    subCategory = subCategories[index];
    const { sel, visible } = subCategory;

    if (sel)
      subCategoryHandle = await waitForSelector(page, sel, 5000, visible);
  

    if (subCategoryHandle) break;
  }
  return { subCategoryHandle, subCategory };
};

export default findSubCategories;
