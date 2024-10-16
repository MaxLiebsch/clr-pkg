import { Content } from './product';

export interface ProductList {
  sel: string;
  timeout?: number;
  awaitProductCntSel?: boolean;
  waitProductCntSel?: number;
  productsPerPage?: number;
  productCntSel: string[];
  product: IProductSelector;
}

export interface IProductSelector {
  sel: string;
  type: string;
  details: Detail[];
}

export type DetailType =
  | 'data-llsrc'
  | 'data-original'
  | 'data-loadbee-gtin'
  | 'data-flix-ean'
  | 'data-srcset'
  | 'srcset'
  | 'content'
  | 'label'
  | 'title'
  | 'list'
  | 'table'
  | 'data-src'
  | 'value'
  | 'href'
  | 'alt'
  | 'src'
  | 'exist'
  | 'text'
  | 'parse_json'
  | 'parse_object_property'
  | 'parse_json_element'
  | 'nested'
  | 'nested_remove';

export interface Detail {
  content: Content;
  sel: string;
  listItemInnerSel?: string;
  listItemType?: string;
  type: DetailType;
  row?: string;
  head?: string;
  step?: number;
  parent?: string;
  baseUrl?: string;
  extractPart?: number;
  multiple?: boolean;
  shadowRoot?: boolean;
  regexp?: string;
  keys?: string[];
  fallback?:string;
  path?: string | string[];
  proprietaryProducts?: string;
  attr?: string;
  key?: string;
  redirect_regexp?: string;
  urls?: {
    redirect: string;
    default: string;
  };
  remove?: string;
}
