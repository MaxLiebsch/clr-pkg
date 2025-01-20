import { QueryKeys } from "./query";

export type ActionType =
  | 'button'
  | 'element'
  | 'scroll'
  | 'input'
  | 'select'
  | 'shadowroot-button'
  | 'shadowroot-button-test'
  | 'shadowroot-select'
  | 'shadowroot-input'
  | 'shadowroot-checkbox'
  | 'recursive-button';

export interface BaseAction {
  type: ActionType;
  sel: string;
  interval?: number;
  name: string;
  step?: number;
  action: 'waitBefore' | 'waitAfter' | 'click' | 'delete' | 'scroll';
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
  wait?: boolean;
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