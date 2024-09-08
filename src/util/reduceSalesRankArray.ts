import { createUnixTimeFromKeepaTime } from './helpers';

export const reduceSalesRankArray = (array: number[]) => {
  let steps = 8;
  switch (true) {
    case array.length / 2 < 7:
      steps = 2;
      break;
    case array.length / 2 > 400:
      steps = 24;
      break;
  }
  const parsedArray: [number, number][] = [];
  const dates: string[] = [];
  for (let i = 0; i < array.length; i += steps) {
    const unixTimestamp = createUnixTimeFromKeepaTime(array[i]);
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const day = date.getDate();
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
    if (dates.some((_) => _ === dateStr)) {
      continue;
    } else {
      dates.push(dateStr);
      parsedArray.push([array[i], array[i + 1]]);
    }
  }
  return parsedArray;
};
