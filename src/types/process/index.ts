export type CrawlEan = {
  properties: 'found' | 'missing' | 'timeout' | 'invalid';
};

export enum CrawlEanProps {
  found = 'found',
  missing = 'missing',
  timeout = 'timeout',
  invalid = 'invalid',
}

export enum LookupCategoryProps {
  complete = 'complete',
  timeout = 'timeout',
  ean_missing = 'ean_missing',
  ean_missmatch = 'ean_missmatch',
  categories_missing = 'categories_missing',
  category_not_found = 'category_not_found',
}

export type LookupInfoPropType =
  | 'complete'
  | 'missing'
  | 'incomplete'
  | 'no_bsr'
  | 'not_found';

export enum LookupInfoProps {
  complete = 'complete',
  missing = 'missing',
  incomplete = 'incomplete',
  no_bsr = 'no_bsr',
  not_found = 'not_found',
}

export enum QueryEansOnEbyProps {
  complete = 'complete',
  missing = 'missing',
}

export enum MatchProductsProps {
  complete = 'complete',
  missing = 'missing',
}
