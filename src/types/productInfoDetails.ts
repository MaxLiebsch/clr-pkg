import { Content } from "./product";

export interface DetailBase {
  content: Content;
  parent?: string;
  sel: string;
  type: string;
  shadowRoot?: boolean;
  timeout?: number;
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

export interface IParseJSONElementDetail extends DetailBase {
  path: string | string[];
  multiple: boolean;
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
