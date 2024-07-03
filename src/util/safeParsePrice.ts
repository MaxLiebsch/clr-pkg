import parsePrice from 'parse-price';

const priceRegexp = /\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})*(?:,\d+)/g;

export const safeParsePrice = (
  priceStr: string | number | boolean | string[],
) => {
  const priceRegExp = new RegExp(priceRegexp);

  if (typeof priceStr === 'string') {
    if (
      (priceStr.slice(priceStr.length - 1) === '€' || priceStr.slice(0,1) === '€') &&
      priceStr.match(/\./g)?.length === 1 && !priceStr.includes(',') &&
      priceStr.match(/\.\d{2}\s/g)  === null
    ) {
      return Number(priceStr.match(/\d+/g)?.join('')) || 0;
    }
    const match = priceStr.match(priceRegExp);
    if (match) {
      priceStr = match[0];
    }
  }
  const price = parsePrice(priceStr);

  const parsedPrice = parseFloat(price.toFixed(2));

  return isNaN(parsedPrice) ? 0 : parsedPrice;
};
