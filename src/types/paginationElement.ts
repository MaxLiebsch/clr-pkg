export interface PaginationElement {
  type: string;
  sel: string;
  nav: string;
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
  replace: string;
  withQuery: boolean;
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
    offset: number;
  };
}

export interface Calculation {
  method: PaginationCalculationMethod;
  last: string;
  attribute?: string;
  productsPerPage?: number;
  textToMatch?: string;
  dynamic?: boolean;
  sel: string;
}
