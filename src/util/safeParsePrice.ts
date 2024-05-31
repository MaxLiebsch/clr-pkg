import parsePrice from 'parse-price';

const priceRegexp = /\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})*(?:,\d+)/g

export const safeParsePrice = (
  priceStr: string | number | boolean | string[],
) => {
  const priceRegExp = new RegExp(priceRegexp);

  if(typeof priceStr === 'string') {
    const match = priceStr.match(priceRegExp);
    if (match) {
      priceStr = match[0];
    }
  }
  const price = parsePrice(priceStr);

  const parsedPrice = parseFloat(price.toFixed(2));

  return isNaN(parsedPrice) ? 0 : parsedPrice;
};

