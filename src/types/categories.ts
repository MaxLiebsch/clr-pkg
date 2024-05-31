export interface Categories {
    sel: string;
    exclude: string[];
    wait?: number;
    categoryNameSegmentPos?: number;
    categoryRegexp?: string;
    visible?: boolean;
    type: string;
    subCategories: SubCategoriesSel[];
  }
  
  export interface SubCategoriesSel {
    visible?: boolean;
    sel: string;
    type: string;
  }