import { Limit } from '../../types';

export const calculatePageCount = (limit: Limit, pageCount: number) => {
  const limitPages = limit?.pages ?? 0;

  const noOfPages =
    limitPages > pageCount ? pageCount : limitPages || pageCount;

  return noOfPages;
};
