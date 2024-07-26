import bunches from '../../constants/bunch.json';
import length from '../../constants/length.json';
import { replaceAllHiddenCharacters } from '../helpers';
import {
  exceptionsStrings,
  packNegations,
  packStrings,
  piecesStrings,
  specialKeywords,
  xTimesNegations,
} from '../../constants/packageRecognition';

/**
 * Regular expression pattern for matching package-related strings.
 * Matches patterns like: 123-pack, 456_packung, package, set, pcs, Stk, St, Stück, x (if not followed by a letter).
 */

const dev = process.env.NODE_ENV === 'development';

//Packs: (\(|^|\s)(?<!inkl\.\s)\d{1,2}\s*[-_]?\s*(er|)\s*[-_]?\s*(kameras)

const createPackRegex = (packs: string[]) => {
  return new RegExp(
    `(\\(|^|\\s)(?<!${packNegations.join('|')})\\d{1,2}\\s*[-_]?\\s*(er|)\\s*[-_]?\\s*(${packs.join('|')})`,
    'g',
  );
};

const VERegex = /\bVE\d+\b/g; //Verpackubgseinheit

const orphanPackRegex = /\d+er($|\b(?!-|\sWelle|\sSet|\sset))/g;

const createPiecesRegex = (pieces: string[]) => {
  return new RegExp(
    `((?<!für\\s)\\d+|\\d+\\.|)\\d+\\s*(${pieces.join('|')})`,
    'g',
  );
};
const createExceptionsRegex = (exceptions: string[]) => {
  return new RegExp(
    `((?<!für\\s)\\d+|\\d+\\.)\\d+\\s*(${exceptions.join('|')})`,
    'g',
  );
};
const setRegex = /\sSet\s*\d{1,2}(?!(-|\.))\b/g;

const bracketRegex = /\(\d+\s*x\s*\d+/g;

// /((?<!\+)\b\d{1,2}\s*x\s*\d+((?:[\d,.]*\d+)|(?!,|\.)))(?!([Xx]|\s*[xX]|\sGHz))/g;

const createxTimesPiecesRegex = () => {
  return new RegExp(
    `((?<!\\+)\\b\\d{1,2}\\s*x\\s*\\d+((?:[\\d,.]*\\d+)|(?!,|\\.)))(?![Xx]|\\s*[xX]|${xTimesNegations.join('|')})`,
    'g',
  );
};

const createXRegex = (xTimesNegation: string[]) => {
  return new RegExp(
    `\\b\\d{1,4}\\s*x\\s(?!(${xTimesNegation.join('|')}))`,
    'g',
  );
};

const sizeRegex = /\d+\s*x\d+/g;

const xTimesRegex = /^\d+\s*x /gi;

export const getPieces = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(createPiecesRegex(piecesStrings))];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

export const threeDimensionalRegex =
  /H\s\d+\s[xX]\sB\s\d+\sx\sT\s\d+\s(mm|m\b|cm\b|$)/g;

const regexps = [
  'ø\\s*\\d+\\s*x\\s*\\d+\\s*cm',
  '\\d+([.,]\\d+)?\\s*(meter|mm|m|cm|)\\s*[xX-a]\\s*\\d+([.,]\\d+)?\\s*(meter|mm|m|cm|pixel|Pixel)\\b',
  '\\d+\\s*x\\s*\\d+\\s*x\\s*\\d+\\s*,?\\d*\\s*(cm|m|mm|meter)',
];

export const getPacks = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(createPackRegex(packStrings))];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

const packungRegex = /(\bPackung)\s*(mit|with)\s*\d+/g;

export const getPackung = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(packungRegex)];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

export const parsePackQuantity = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(buildRegexForBunches())];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

export const parseDimensions = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(buildRegexForLength())];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

export function buildRegexForBunches() {
  let pattern = Object.values(bunches)
    .map((units) =>
      Object.values(units)
        .flatMap((magintudeStrs) =>
          magintudeStrs.map(
            (unit) =>
              unit
                .replaceAll('/', '\\/')
                .replaceAll('-', '\\-')
                .replaceAll('"', '\\"')
                .replaceAll("''", "\\'\\'")
                .replaceAll('^', '\\^')
                .replaceAll('.', '\\.')
                .replaceAll('″', '\\″') + '\\b',
          ),
        )
        .join('|'),
    )
    .join('|');

  return new RegExp(
    `((^\\s| |)\\d+\\s*[xX])\\s*(\\d+([,.]\\d+)*|\\d+)\\s*(${pattern})`,
    'g',
  );
}

export function buildRegexForLength() {
  let pattern = Object.values(length)
    .map((units) =>
      Object.values(units)
        .flatMap((magintudeStrs) =>
          magintudeStrs.map(
            (unit) =>
              unit
                .replaceAll('/', '\\/')
                .replaceAll('-', '\\-')
                .replaceAll('"', '\\"')
                .replaceAll("''", "\\'\\'")
                .replaceAll('^', '\\^')
                .replaceAll('.', '\\.')
                .replaceAll('″', '\\″') + '\\b',
          ),
        )
        .join('|'),
    )
    .join('|');

  return new RegExp(
    `((^\\s| |)\\d+\\s*[xX])\\s*(\\d+([,.]\\d+)*|\\d+)\\s*(${pattern})`,
    'g',
  );
}
//((^\s| |)\d+\s*[xX])\s*(\d+([,.]\d+)*|\d+)\s*(cm\b)
let _title = '';
export const detectQuantity = (title: string) => {
  let debug = false;
  if (dev)
    if (title.includes(_title)) {
      debug = true;
    } else {
      debug = false;
    }

  const trimmed = replaceAllHiddenCharacters(title)
    .trim()
    .replace(/[?¿!]/g, '');
  debug && console.log('Title: ', title, '\n', trimmed);
  const xRegex = createXRegex(xTimesNegations);
  const exceptionsRegex = createExceptionsRegex(exceptionsStrings);
  const pieces = getPieces(trimmed);
  const xTimesPieces = createxTimesPiecesRegex();
  const packs = getPacks(trimmed);
  debug && console.log('packs:', packs);
  if (packs) {
    const match = packs[0].match(/\d+/g);
    const matches = regexps.map((regex) => title.match(new RegExp(regex, 'g')));
    debug && console.log('matches:', matches);
    const filteredMatches = matches.filter((m) => m && m.length > 0);
    debug && console.log('filteredMatches:', filteredMatches);
    const packSeemsPartOfDimension = filteredMatches.some((match) => {
      if (match![0].includes(packs[0])) {
        return true;
      } else {
        return false;
      }
    });
    if (match && packSeemsPartOfDimension) {
      return null;
    }
    if(pieces){
      const match = pieces[0].match(/\d+/g);
      debug && console.log('pieces, no bunch, match:', match);
      return match ? Number(match.join('')) : null;
    }
    return match ? Number(match[0]) : null;
  }

  const bunch = parsePackQuantity(trimmed);
  if (xTimesRegex.test(trimmed)) {
    const match = trimmed.match(xTimesRegex);
    debug && console.log('xTimesRegex match:', match);
    if (bunch && bunch.length > 0) {
      const match = trimmed.match(xTimesRegex);
      if (bunch[0].includes(match![0])) {
        const split = bunch[0].toLocaleLowerCase().split('x');
        const match = split[0].match(/\d+/g);
        return match ? Number(match.join('')) : null;
      }
    }
    debug && console.log('xTimesRegex bunch:', bunch);
    if (sizeRegex.test(title)) {
      return null;
    }
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  const packung = getPackung(trimmed);
  debug && console.log('packung:', packung);
  if (packung) {
    const match = packung[0].match(/\d+/g);
    return match ? Number(match[0]) : null;
  }
  debug && console.log('pieces:', pieces);
  if (pieces) {
    if (bunch) {
      const match = bunch[0].match(/\d+/g);
      return match ? Number(match[0]) : null;
    } else {
      const match = pieces[0].match(/\d+/g);
      debug && console.log('pieces, no bunch, match:', match);
      return match ? Number(match.join('')) : null;
    }
  }
  const parsedDimensions = parseDimensions(trimmed);
  if (xRegex.test(trimmed)) {
    const match = trimmed.match(xRegex);
    debug && console.log('1. xRegex Match...');
    if (bunch) {
      debug && console.log('1. xRegex Match: bunch:', bunch);
      return null;
    }
    if (parsedDimensions) {
      debug &&
        console.log('1. xRegex Match: parsedDimensions:', parsedDimensions);
      debug && console.log('1. xRegex Match: match![0]:', match![0]);
      if (parsedDimensions[0].trim().includes(match![0].trim())) {
        return null;
      }
    }
    if (threeDimensionalRegex.test(trimmed)) {
      const parsedThreeDimension = trimmed.match(threeDimensionalRegex);
      if (
        match?.some((m) => parsedThreeDimension?.some((p) => p.includes(m)))
      ) {
        return null;
      }
      console.log('match:', match);
    }
    debug && console.log('1. xRegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  debug && console.log('bunch:', bunch);
  if (bunch) {
    const split = bunch[0].toLocaleLowerCase().split('x');
    const match = split[0].match(/\d+/g);
    return match ? Number(match[0]) : null;
  }

  if (xRegex.test(trimmed)) {
    debug && console.log('2. xRegex Match...');
    if (bunch) {
      debug && console.log('2. xRegex Match: bunch:', bunch);
      return null;
    }
    const match = trimmed.match(xRegex);
    debug && console.log('2. xRegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  if (setRegex.test(trimmed)) {
    const match = trimmed.match(setRegex);
    debug && console.log('setRegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  if (bracketRegex.test(trimmed)) {
    const match = trimmed.match(bracketRegex);

    debug && console.log('bracketRegex Match:', match);
    const split = match![0].split('x');
    return Number(split[0].match(/\d+/g));
  }

  if (xTimesPieces.test(trimmed)) {
    debug && console.log('parsedDimensions:', parsedDimensions);
    if (parsedDimensions) {
      return null;
    }
    const match = trimmed.match(xTimesPieces);
    debug && console.log('xTimesPieces Match:', match);
    const split = match![0].split('x');
    return match ? Number(split[0].match(/\d+/g)) : null;
  }

  if (orphanPackRegex.test(trimmed)) {
    const match = trimmed.match(orphanPackRegex);
    debug && console.log('orphanPackRegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  if (exceptionsRegex.test(trimmed)) {
    const match = trimmed.match(exceptionsRegex);
    debug && console.log('exceptionsRegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  if (VERegex.test(trimmed)) {
    const match = trimmed.match(VERegex);
    debug && console.log('VERegex Match:', match);
    return match ? Number(match[0].match(/\d+/g)) : null;
  }
  const lowerCaseTrimmed = trimmed.toLowerCase();
  for (const keyword of specialKeywords) {
    if (lowerCaseTrimmed.includes(keyword.key)) {
      debug &&
        console.log(
          'trimmed.toLowerCase(:',
          trimmed.toLowerCase(),
          keyword.key,
        );
      return keyword.size;
    }
  }

  debug && console.log('No match found');
  return null;
};

_title =
  'Pampers Windeln Größe 7 (15kg+) Baby-Dry, Extra Large, MONATSBOX, bis zu 12 Stunden Rundum-Auslaufschutz, (1er Pack) 132 Stück';
