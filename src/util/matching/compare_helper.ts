import { TargetShop } from '../../types';
import { CandidateProduct, Product } from '../../types/product';
import { ProdInfo } from '../../util.services/queue/QueryQueue';
import { roundToTwoDecimals } from '../helpers';
import { safeParsePrice } from '../safeParsePrice';
import {
  buildRegexForSiUnits,
  classifyMeasurements,
  levelNormalizedMeasurements,
  numberRegExp,
} from './normalizeSIUnits';

export const priceRegexp = /\d{1,5}(?:[.,]\d{3})*(?:[.,]\d{2,4})/g;
const regex = /[^A-Za-z0-9\s,.öäÖÄüÜ\-]/g;
const dimensionRegex =
  /(Ø|)(\d+\s*[xX-a]|)\s*\d+([.,]\d+)?\s*(mm|ml|m|cm|meter|kg|)\s*[xX-a]\s*\d+([.,]\d+)?\s*(meter|ml|mm|m|cm|kg|g|Stück|St|kapseln|pixel|)/gi;
const inOperatorRegex = /(\d+)\s*(in|from|of|von)\s*(\d+)/gi;
export const excludeCharsAndSplit = (name: string) =>
  cleanString(name)
    .split(' ')
    .map((item: string) => item.toLowerCase());

export const segmentString = (name: string) => {
  const segments = [];
  let update = name;
  update = update.replaceAll(/[-]/g, ' ');
  update = update.replaceAll(/[\/]/g, ' ');

  // inOperators
  let inOperators = getInOperators(name);
  inOperators.forEach((unit) => {
    update = update.toLowerCase().replaceAll(unit.toLowerCase(), '');
  });
  inOperators = inOperators.map((d) => d.replaceAll(' ', '').trim());

  //dimensions
  let dimensions = getDimensions(name);
  dimensions.forEach((unit) => {
    update = update.toLowerCase().replaceAll(unit.toLowerCase(), '');
  });
  dimensions = dimensions.map((d) => d.replaceAll(' ', '').trim());

  const siUnits = getSIUints(update);

  siUnits.forEach((unit) => {
    if (new RegExp(numberRegExp).test(unit)) {
      update = update.toLowerCase().replaceAll(unit.toLowerCase() + '°', '');
    }
    update = update.toLowerCase().replaceAll(unit.toLowerCase(), '');
  });

  update = cleanString(update);

  const normalizedMeasurements = levelNormalizedMeasurements(
    classifyMeasurements(siUnits),
  ).map((measure: { str: string }) => measure.str);

  segments.push(
    ...normalizedMeasurements,
    ...dimensions,
    ...inOperators,
    ...excludeCharsAndSplit(update),
  );
  return segments;
};

export const segmentFoundProds = (candidates: Product[]) =>
  candidates.map((candidate) => {
    return {
      ...candidate,
      nameSegments: candidate?.name ? segmentString(candidate.name) : [],
    };
  });

export function prefixLink(
  src: string,
  shopDomain: string,
  leaveDomainAsIs?: boolean,
) {
  if (!src || src === '') return '';

  let newSrc = src;

  newSrc = newSrc.replaceAll(/[\n\r\t]/g, '');

  if (newSrc.startsWith('//')) {
    return 'https:' + newSrc;
  }

  if (!newSrc.startsWith('https://')) {
    return 'https://www.' + shopDomain + newSrc;
  }
  if (newSrc.startsWith('https://' + shopDomain) && !leaveDomainAsIs) {
    return newSrc.replace(shopDomain, `www.${shopDomain}`);
  }
  return newSrc;
}

export function getManufacturer(src: string) {
  const split = src.split(' ');
  if (split.length > 1) {
    return {
      mnfctr: split[0].trim(),
      prodNm: src.replace(split[0], '').trim(),
    };
  } else {
    return {
      mnfctr: '',
      prodNm: src,
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
  const match = priceStr.match(priceRegexp);
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
    return match;
  } else {
    return null;
  }
};

export const getNumber = (priceStr: string) => {
  const match = priceStr.match(/(\d+(?=\s*\w*$)|\d+)/g);
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

export const getInOperators = (str: string) => {
  const inOperators: string[] = [];
  const matches = [...str.matchAll(inOperatorRegex)];
  matches.forEach((unit) => {
    inOperators.push(unit[0]);
  });
  return inOperators;
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

export const findBestMatch = (
  foundProds: CandidateProduct[],
  prodInfo: ProdInfo,
) => {
  let bestMatchIndex = -1;
  let highScore = 0;
  const { procProd, dscrptnSegments, nmSubSegments } = prodInfo;
  const { nm, prc, mnfctr } = procProd;
  const nameSplit = segmentString(nm);

  foundProds.forEach((product, index) => {
    const curr_prc = safeParsePrice(product.price);
    const mrgn = roundToTwoDecimals(curr_prc - prc);
    const curr_mrgn_pct = roundToTwoDecimals((mrgn / prc) * 100);
    let score = 0;

    // switch (true) {
    //   case curr_mrgn_pct < -50:
    //     score += -4;
    //     break;
    //   case curr_mrgn_pct >= -50 && curr_mrgn_pct < -30:
    //     score += -3;
    //     break;
    //   case curr_mrgn_pct >= -30 && curr_mrgn_pct < 30:
    //     score += +2;
    //     break;
    //   case curr_mrgn_pct >= 30 && curr_mrgn_pct <= 50:
    //     score += -3;
    //     break;
    //   case curr_mrgn_pct > 50:
    //     score += -4;
    //     break;
    // }

    dscrptnSegments.forEach((giveWord: string) => {
      if (product.nameSegments.includes(giveWord)) {
        score++;
      }
    });

    if (product.nameSegments.includes(mnfctr.toLowerCase())) {
      score += 2;
    }

    nameSplit.forEach((giveWord) => {
      if (product.nameSegments.includes(giveWord)) {
        score += 2;
      }
    });

    if (score > highScore) {
      highScore = score;
      bestMatchIndex = index;
    }
  });
  return bestMatchIndex >= 0 ? foundProds[bestMatchIndex] : null;
};

interface ResultObject {
  [key: string]: any;
}

export interface Arbitrage {
  [key: string]: any;
}

export const addBestMatchToProduct = (
  candidates: CandidateProduct[],
  shop: TargetShop,
  prodInfo: ProdInfo,
) => {
  const { procProd } = prodInfo;
  const { nm, prc, mnfctr } = procProd;
  let result: ResultObject = {};
  const bestMatch = findBestMatch(candidates, prodInfo);

  if (bestMatch) {
    const arbitrage = calculateArbitrage(prc, bestMatch, shop);
    result = { ...result, arbitrage };
  }
  return { arbitrage: result as Arbitrage, bestMatch };
};

export function calculateArbitrage(
  srcPrice: number,
  bestMatch: Product,
  targetShop: TargetShop,
) {
  const { price: bm_prc } = bestMatch;
  const arbitrageInfo: { [key: string]: any } = {};
  const { d: domain, prefix } = targetShop;
  if (typeof srcPrice === 'number' && typeof bm_prc === 'number') {
    Object.entries(bestMatch).forEach(([key, value]) => {
      if (['link', 'image', 'name', 'price'].includes(key)) {
        if (key === 'link') {
          arbitrageInfo[`${prefix}` + key.replace(/[aeiou]/gi, '')] = value;
        } else if (key === 'image') {
          arbitrageInfo[`${prefix}` + key.replace(/[aeou]/gi, '')] = value;
        } else {
          arbitrageInfo[`${prefix}` + key.replace(/[aeiou]/gi, '')] = value;
        }
      }
    });

    if (bm_prc && srcPrice) {
      const mrgn = roundToTwoDecimals(bm_prc - srcPrice);
      const mrgn_pct = roundToTwoDecimals((mrgn / srcPrice) * 100);
      const arbitrage = {
        prc: bm_prc,
        mrgn,
        mrgn_pct,
      };
      Object.entries(arbitrage).forEach(([key, value]) => {
        arbitrageInfo[`${prefix}` + key] = value;
      });
    }
  }
  return arbitrageInfo;
}

export function reduceString(str: string, limit: number) {
  let query = str;

  query = query
    .replaceAll(/([\b\r\n]|\\r|\\b|\\n)/g, ' ')
    .replaceAll(/[\\(\\)]/g, '')
    .replaceAll(/[,&@:]/g, ' ')
    .replaceAll(/ +/g, ' ')
    .trim();

  // Check if the string is already within the limit
  if (query.length <= limit) return query;

  // Find the index of the last space within the limit
  let lastSpace = query.substring(0, limit).lastIndexOf(' ');

  // If there is no space in the range, try to find the first space after the limit
  if (lastSpace === -1) {
    lastSpace = query.indexOf(' ', limit);
    // If there is still no space, return the whole string
    if (lastSpace === -1) return str;
  }

  // Return the substring up to the last space found
  return query.substring(0, lastSpace);
}
