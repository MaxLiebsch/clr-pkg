export interface PaginationElement {
  type: 'pagination' | 'infinite_scroll'| 'recursive-more-button' | 'scroll-and-click';
  sel: string;
  nav: string;
  visible?: boolean;
  wait?: boolean;
  initialUrl?: {
    type: string;
    regexp: string;
  };
  paginationUrlSchema?: PaginationUrlSchema;
  calculation: Calculation;
}
export type PaginationCalculationMethod =
  | 'button'
  | 'first_last'
  | 'find_highest'
  | 'estimate'
  | 'product_count'
  | 'element_attribute'
  | 'count'
  | 'match_text';

export type PaginationUrlSchemaMethod =
  | 'offset'
  | 'replace_append'
  | 'find_pagination_apendix';

export interface PaginationUrlSchema {
  replace?: 'attach_end';
  replaceRegexp?: string;
  withQuery?: boolean;
  parseAndReplace?: {
    regexp: string;
    replace: string;
  };
  calculation: {
    method: PaginationUrlSchemaMethod;
    sel?: string;
    type?: string;
    appendix?: string;
    replace?: {
      use?: string;
      skip?: number;
      search: string;
      replace?: string;
    }[];
    startOffset?: number; // abfalleimer-348?take=48+60 the 48 is the startOffset, so that the next page will be 108, 168, etc.
    offset?: number;
  };
}

export interface Calculation {
  method: PaginationCalculationMethod;
  last?: string;
  attribute?: string;
  productsPerPage?: number;
  textToMatch?: string;
  dynamic?: boolean;
  sel?: string;
}
