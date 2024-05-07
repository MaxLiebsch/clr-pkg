import { Content } from '.';

export interface DetailBase {
  content: Content;
  parent?: string;
  sel: string;
  type: string;
  proprietaryProducts?: string;
}

export interface ITextDetail extends DetailBase {
  extractPart?: number;
  regexp?: string;
}

export interface IAttributeDetail extends DetailBase {
  baseUrl: string;
  regexp?: string;
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
  | IAttributeDetail
  | NestedNameDetail
  | ExistDetail
  | IParseJSONDetail
  | ExistDetail;
