

export interface SiteMap {
  [key: string]: ICategoryStats;
}

export interface ProductPage {
  offset?: number;
  missing?: string;
  link: string;
  cnt?: number;
}

export interface SubCategory {
  link: string;
  cnt_category?: number;
  cnt_pages?: number;
  cnt_products?: number;
  productpages?: ProductPage[];
  subcategories?: {
    [key: string]: SubCategory;
  };
}

export interface SubCategories {
  [key: string]: SubCategory;
}

export interface ICategoryStats {
  default: {};
  link: string;
  name: string;
  cnt_category: number;
  subcategories: SubCategories;
}
