import { Content } from './product';

export interface ProductList {
  sel: string;
  type: string;
  timeout?: number;
  awaitProductCntSel?: boolean;
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
  | 'data-srcset'
  | 'srcset'
  | 'content'
  | 'data-src'
  | 'value'
  | 'href'
  | 'alt'
  | 'src'
  | 'exist'
  | 'text'
  | 'parse_json'
  | 'parse_object_property'
  | 'nested'
  | 'nested_remove';

export interface Detail {
  content: Content;
  sel: string;
  type: DetailType;
  step?: number;
  baseUrl?: string;
  extractPart?: number;
  regexp?: string;
  proprietaryProducts?: string;
  attr?: string;
  key?: string;
  redirect_regex?: string;
  urls: {
    redirect: string;
    default: string;
  };
  remove: string;
}
