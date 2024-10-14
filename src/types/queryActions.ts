import { QueryKeys } from "./query";

export type ActionType =
  | 'button'
  | 'element'
  | 'input'
  | 'select'
  | 'shadowroot-button'
  | 'shadowroot-input'
  | 'shadowroot-button-test'
  | 'recursive-button';

export interface BaseAction {
  type: ActionType;
  action: string;
  sel: string;
  input_sel?: string;
  name: string;
  step?: number;
}

export interface RemoveAction extends BaseAction {
  interval: number;
}

export interface ButtonAction extends BaseAction {
  wait: boolean;
  waitDuration?: number;
  target?: string;
  btn_sel?: string;
}

export interface recursiveButtonAction extends BaseAction {
  action: string;
  wait: boolean;
  waitDuration?: number;
  target?: string;
  btn_sel?: string;
}

export interface SelectAction extends BaseAction {
  what: QueryKeys;
  wait: boolean;
}
export interface InputAction extends BaseAction {
  what: QueryKeys[];
  wait: boolean;
}

export type QueryAction =
  | ButtonAction
  | SelectAction
  | InputAction
  | recursiveButtonAction;

export type CrawlAction = QueryAction;

export interface Limit {
  mainCategory: number;
  subCategory: number;
  pages: number;
}
