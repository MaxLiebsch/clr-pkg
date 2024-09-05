import parsePrice from 'parse-price';
import { roundToTwoDecimals } from './helpers';

const priceRegexp = /\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})*(?:,\d+)?/g;

const replaceSecondDot = (str: string): string => {
  let count = 0;
  return str.replace(/\./g, (match) => {
    count += 1;
    return count === 2 ? ',' : match;
  });
};

export const safeParsePrice = (
  priceStr: string | number | boolean | string[],
) => {
  const priceRegExp = new RegExp(priceRegexp);

  if (typeof priceStr === 'string') {
    const multipleDots = priceStr.match(/\./g);
    if (multipleDots && multipleDots.length > 1) {
      priceStr = replaceSecondDot(priceStr);
    }

    if (
      (priceStr.slice(priceStr.length - 1) === '€' ||
        priceStr.slice(0, 1) === '€') &&
      priceStr.match(/\./g)?.length === 1 &&
      !priceStr.includes(',') &&
      priceStr.match(/\.\d{2}\s/g) === null
    ) {
      return Number(priceStr.match(/\d+/g)?.join('')) || 0;
    }

    const match = priceStr.match(priceRegExp);
    if (match) {
      priceStr = match[0];
    }
  }

  if (typeof priceStr === 'number') {
    if (
      priceStr.toString().match(/\.\d{3,4}\b/) &&
      !priceStr.toString().includes(',')
    ) {
      console.log(
        'priceStr.toString().match(/.d{3,4}/):',
        priceStr.toString().match(/\.\d{3,4}/),
      );
      priceStr = priceStr.toString().replace(/\./g, '');
    }
  }

  const price = parsePrice(priceStr);

  const parsedPrice = roundToTwoDecimals(price);

  return isNaN(parsedPrice) ? 0 : parsedPrice;
};

const currency = [
  {
    iso: 'USD',
    symbol: '\\$',
  },
  {
    iso: 'EUR',
    symbol: '€',
  },
  {
    iso: 'GBP',
    symbol: '£',
  },
  {
    iso: 'CHF',
    symbol: 'Fr',
  },
  {
    iso: 'TRY',
    symbol: '₺',
  },
  {
    iso: 'PLN',
    symbol: 'zł',
  },
  {
    iso: 'CZK',
    symbol: 'Kč',
  },
  {
    iso: 'DKK',
    symbol: 'kr',
  },
  {
    iso: 'NOK',
    symbol: 'kr',
  },
  {
    iso: 'SEK',
    symbol: 'kr',
  },
  {
    iso: 'ISK',
    symbol: 'kr',
  },
  {
    iso: 'RUB',
    symbol: '₽',
  },
  {
    iso: 'UAH',
    symbol: '₴',
  },
  {
    iso: 'RON',
    symbol: 'lei',
  },
  {
    iso: 'HUF',
    symbol: 'Ft',
  },
  {
    iso: 'BGN',
    symbol: 'лв',
  },
  {
    iso: 'HRK',
    symbol: 'kn',
  },
  {
    iso: 'RSD',
    symbol: 'дин.',
  },
  {
    iso: 'MKD',
    symbol: 'ден.',
  },
  {
    iso: 'BAM',
    symbol: 'KM',
  },
  {
    iso: 'GEL',
    symbol: 'ლ',
  },
  {
    iso: 'MDL',
    symbol: 'lei',
  },
];

const buildCurrencyRegex = () => {
  const currencyRegex = currency.map((c) => c.symbol + '|' + c.iso).join('|');
  return new RegExp(`(${currencyRegex})`, 'i');
};

export const detectCurrency = (input: string) => {
  if (typeof input !== 'string') return null;
  const currencyRegex = buildCurrencyRegex();
  const match = input.match(currencyRegex);
  if (match) {
    const _currency = currency.find(
      (c) => c.symbol === match[0] || c.iso === match[0],
    );
    return _currency?.iso || null;
  }
  return null;
};
