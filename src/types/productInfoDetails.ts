import { Content } from './product';

export interface DetailBase {
  content: Content;
  parent?: string;
  sel: string;
  type: string;
  shadowRoot?: boolean;
  timeout?: number;
  proprietaryProducts?: string;
}

type Merge<X, Y> = {
  [K in keyof X | keyof Y]:
    | (K extends keyof X ? X[K] : never)
    | (K extends keyof Y ? Y[K] : never);
};

export interface IListDetail extends Merge<ITextDetail, IAttributeDetail> {
  seperator?: string;
  listItemType: string;
  listItemInnerSel: string;
}

export interface ITableDetail extends DetailBase {
  head: string;
  keys: string[];
  row: string;
}

export interface ITextDetail extends DetailBase {
  extractPart?: number;
  regexp?: string;
}

export interface IAttributeDetail extends DetailBase {
  baseUrl: string;
  regexp?: string;
}

export interface IParseJSONElementDetail extends DetailBase {
  path: string | string[];
  multiple: boolean;
  regex?: string;
}

export interface IParseJSONDetail extends DetailBase {
  attr: string;
  key: string;
  urls: {
    redirect: string;
    default: string;
  };
  redirect_regex: string;
}

export interface ExistDetail extends DetailBase {}

export interface NestedNameDetail extends DetailBase {
  remove: string;
}

export type Details =
  | ITextDetail
  | ITableDetail
  | IAttributeDetail
  | NestedNameDetail
  | ExistDetail
  | IParseJSONDetail
  | ExistDetail;
