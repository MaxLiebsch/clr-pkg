import { SubCategories } from '../fs/stats';
import { ICategory } from './getCategories';

export const transformCategories = (subCategLnks: ICategory[]) =>
  subCategLnks.reduce<SubCategories>(
    (subcategories: SubCategories, category: ICategory) => {
      subcategories = {
        ...subcategories,
        [category.name]: {
          link: category.link,
        },
      };
      return subcategories;
    },
    {},
  );
