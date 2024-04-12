import {
  CandidateProduct,
  DbProduct,
  Product,
  SrcProductDetails,
} from '../types/product';
import {
  buildRegexForSiUnits,
  classifyMeasurements,
  levelNormalizedMeasurements,
  numberRegExp,
} from './normalizeSIUnits';
import parsePrice from 'parse-price';

const regexp = /\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})/g;
const regex = /[^A-Za-z0-9\s,.öäÖÄüÜ\-]/g;
const dimensionRegex =
  /(Ø|)\s*\d+([.,]\d+)?\s*(mm|m|cm|meter|kg|)\s*[xX-a]\s*\d+([.,]\d+)?\s*(mm|m|cm|meter|kg|Stück|St|kapseln|pixel)/gi;

export const getProductNameSplit = (name: string) =>
  cleanString(name)
    .split(' ')
    .map((item: string) => item.toLowerCase());

export const getProductNameSplitAdv = (name: string) => {
  const split = [];
  let update = name;
  let dimensions = getDimensions(name);

  dimensions.forEach((unit) => {
    update = update.toLowerCase().replaceAll(unit.toLowerCase(), '');
  });

  const siUnits = getSIUints(update);

  siUnits.forEach((unit) => {
    if (new RegExp(numberRegExp).test(unit)) {
      update = update.toLowerCase().replaceAll(unit.toLowerCase() + '°', '');
    }
    update = update.toLowerCase().replaceAll(unit.toLowerCase(), '');
  });

  update = cleanString(update);

  dimensions = dimensions.map((d) => d.replaceAll(' ', '').trim());

  const normalizedMeasurements = levelNormalizedMeasurements(
    classifyMeasurements(siUnits),
  ).map((measure) => measure.str);

  split.push(
    ...normalizedMeasurements,
    ...dimensions,
    ...getProductNameSplit(update),
  );
  return split;
};

export const getProductCandidates = (candidates: Product[]) =>
  candidates.map((candidate) => {
    return {
      ...candidate,
      candidateNameSplit: candidate?.name
        ? getProductNameSplitAdv(candidate.name)
        : [],
    };
  });

export function prefixLink(src: string, shopDomain: string) {
  if (!src || src === '') return '';

  if (!src.startsWith('https://')) {
    return 'https://www.' + shopDomain + src;
  }
  return src;
}

export function getManufacturer(src: string) {
  const split = src.split(' ');
  if (split.length > 1) {
    return {
      manufacturer: split[0],
      name: src.replace(split[0], '').trim(),
    };
  } else {
    return {
      manufacturer: '',
      name: src,
    };
  }
}

export const cleanString = (src: string) => {
  return src
    .replace(/\n/g, ' ')
    .replace(/[,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getPrice = (priceStr: string) => {
  const match = priceStr.match(regexp);
  if (match) {
    return match[0]
      .replace(regex, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    return null;
  }
};

export const getNumbers = (str: string) => {
  const match = str.match(/\d+/g);
  if (match) {
    return match
  } else {
    return null;
  }
};


export const getNumber = (priceStr: string) => {
  const match = priceStr.match(/\d+(?=\s*\w*$)/g);
  if (match) {
    if (match.length === 2) {
      return parseInt(match[1].replace(/[.,]/, ''));
    } else {
      return parseInt(match[0].replace(/[.,]/, ''));
    }
  } else {
    return null;
  }
};

export const getDimensions = (str: string) => {
  const dimension: string[] = [];
  const matches = [...str.matchAll(dimensionRegex)];
  matches.forEach((unit) => {
    dimension.push(unit[0]);
  });
  return dimension;
};

export const getSIUints = (str: string) => {
  const siUnits: string[] = [];
  const matches = [...str.matchAll(buildRegexForSiUnits())];
  matches.forEach((unit) => {
    if (unit[3] !== undefined) siUnits.push(unit[0]);
  });
  return siUnits;
};

/*
  <-50         -6
  >-50 && <-30 -3
  >-30  && <30  0
  >30 && <50   -3
  >50          -6
  
*/

export const findBestMatch = (
  descriptionSplit: string[],
  foundProducts: CandidateProduct[],
  manufacturer: string,
  name: string,
  prc: number,
) => {
  let bestMatchIndex = -1;
  let highScore = 0;

  const nameSplit = getProductNameSplit(name);
  foundProducts.forEach((product, index) => {
    const curr_prc = parsePrice(getPrice(product.price ?? 0));
    const mrgn = Number((curr_prc - prc).toFixed(2));
    const curr_mrgn_pct = Number(((mrgn / prc) * 100).toFixed(1));
    let score = 0;

    switch (true) {
      case curr_mrgn_pct < -50:
        score += -4;
        break;
      case curr_mrgn_pct >= -50 && curr_mrgn_pct < -30:
        score += -3;
        break;
      case curr_mrgn_pct >= -30 && curr_mrgn_pct < 30:
        score += +2;
        break;
      case curr_mrgn_pct >= 30 && curr_mrgn_pct <= 50:
        score += -3;
        break;
      case curr_mrgn_pct > 50:
        score += -4;
        break;
    }
    descriptionSplit.forEach((giveWord) => {
      if (product.candidateNameSplit.includes(giveWord)) {
        score++;
      }
    });
    if (product.candidateNameSplit.includes(manufacturer.toLowerCase())) {
      score += 3;
    }

    nameSplit.forEach((giveWord) => {
      if (product.candidateNameSplit.includes(giveWord)) {
        score += 2;
      }
    });

    if (score > highScore) {
      highScore = score;
      bestMatchIndex = index;
    }
  });
  return bestMatchIndex >= 0 ? foundProducts[bestMatchIndex] : null;
};

interface ResultObject {
  [key: string]: any;
}

export const addBestMatchToProduct = (
  candidates: CandidateProduct[],
  shop: { d: string; prefix: string },
  srcProductDetails: SrcProductDetails,
) => {
  const { d: domain, prefix } = shop;
  const { nm, dscrptnSplit, prc, nmSubSplit, mnfctr } = srcProductDetails;
  const result: ResultObject = {};
  const bestMatch = findBestMatch(
    [...dscrptnSplit, ...nmSubSplit],
    candidates,
    mnfctr,
    nm,
    prc,
  );

  if (bestMatch) {
    if (typeof prc === 'number' && typeof bestMatch.price === 'string') {
      Object.entries(bestMatch).forEach(([key, value]) => {
        if (['link', 'image', 'name', 'price'].includes(key)) {
          if (key === 'link') {
            result[`${prefix}` + key.replace(/[aeiou]/gi, '')] = prefixLink(
              value,
              domain,
            );
          } else if (key === 'image') {
            result[`${prefix}` + key.replace(/[aeou]/gi, '')] = value;
          } else {
            result[`${prefix}` + key.replace(/[aeiou]/gi, '')] = value;
          }
        }
      });
      const bm_prc = parsePrice(getPrice(bestMatch.price ?? 0));

      if (bm_prc && prc) {
        const mrgn = Number((bm_prc - prc).toFixed(2));
        const mrgn_pct = Number(((mrgn / prc) * 100).toFixed(1));
        const arbitrage = {
          prc: bm_prc,
          mrgn,
          fat: mrgn > 0 ? true : false,
          mrgn_pct,
        };
        Object.entries(arbitrage).forEach(([key, value]) => {
          result[`${prefix}` + key] = value;
        });
      }
    }
  }
  return result as DbProduct;
};
