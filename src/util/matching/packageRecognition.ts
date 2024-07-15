import bunches from '../../constants/bunch.json';
const bunchRegex =
  /((^\s| |)\d+\s*[xX])\s*\d+\s*(meter|ml|l|mm|m|cm|kg|g|Stück|St|kapseln|pixel)/gi;

/**
 * Regular expression pattern for matching package-related strings.
 * Matches patterns like: 123-pack, 456_packung, package, set, pcs, Stk, St, Stück, x (if not followed by a letter).
 */
const packRegex =
  /\d+\s*[-_]?\s*(er||Dreier)\s*[-_]?\s*(pack|packung|packungen|package|set|pcs)/gi;

const piecesRegex = /\d+\s*(Tabs|Counts|Beutel|Tabletten|Dosen|Windeln|Höschenwindeln|Babywindeln)/g;

const sizeRegex = /\d+\s*x\d+/gi;

const xTimesRegex = /^\d+\s*x/gi;

export const getPieces = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(piecesRegex)];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

const regexps = [
  'ø\\s*\\d+\\s*x\\s*\\d+\\s*cm',
  '\\d+([.,]\\d+)?\\s*(meter|mm|m|cm|)\\s*[xX-a]\\s*\\d+([.,]\\d+)?\\s*(meter|mm|m|cm|pixel|Pixel)\\b',
  '\\d+\\s*x\\s*\\d+\\s*x\\s*\\d+\\s*,?\\d*\\s*(cm|m|mm|meter)',
];

export const getPacks = (str: string) => {
  const pack: string[] = [];
  const matches = [...str.matchAll(packRegex)];
  matches.forEach((unit) => {
    pack.push(unit[0]);
  });
  return pack.length > 0 ? pack : null;
};

const packungRegex = /(\bPackung|\bSet)\s*(mit|with)\s*\d+/g;

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

export function buildRegexForBunches() {
  let pattern = Object.values(bunches)
    .map((units) =>
      Object.values(units)
        .flatMap((magintudeStrs) =>
          magintudeStrs.map((unit) =>
            unit
              .replaceAll('/', '\\/')
              .replaceAll('-', '\\-')
              .replaceAll('"', '\\"')
              .replaceAll("''", "\\'\\'")
              .replaceAll('^', '\\^')
              .replaceAll('.', '\\.')
              .replaceAll('″', '\\″'),
          ),
        )
        .join('|'),
    )
    .join('|');

  return new RegExp(`((^\\s| |)\\d+\\s*[xX])\\s*(\\d+|)\\s*(${pattern}|)`, 'g');
}

export const detectQuantity = (title: string) => {
  process.env.DEBUG && console.log('Title: ', title);
  const trimmed = title
  .trim()
  .replace(/[\\(\\)]/g, '')
  .replace(/,/g, ' ');
  
  const packung = getPackung(trimmed);
  process.env.DEBUG && console.log('packung:', packung);
  if (packung) {
    const match = packung[0].match(/\d+/g);
    return match ? Number(match[0]) : null;
  }
  if (xTimesRegex.test(trimmed)) {
    const match = trimmed.match(xTimesRegex);
    const bunch = parsePackQuantity(trimmed);
    if (bunch && bunch.length > 0) {
      const match = trimmed.match(xTimesRegex);
      if (bunch[0].includes(match![0])) {
        const split = bunch[0].toLocaleLowerCase().split('x');
        const match = split[0].match(/\d+/g);
        return match ? Number(match[0]) : null;
      }
    }
    process.env.DEBUG && console.log('xTimesRegex bunch:', bunch);
    if (sizeRegex.test(title)) {
      return null;
    }
    return match ? Number(match[0].match(/\d+/g)) : null;
  }

  const pieces = getPieces(trimmed);
  process.env.DEBUG && console.log('pieces:', pieces);
  if (pieces) {
    const bunch = parsePackQuantity(trimmed);
    if (bunch) {
      const match = bunch[0].match(/\d+/g);
      return match ? Number(match[0]) : null;
    } else {
      const match = pieces[0].match(/\d+/g);
      return match ? Number(match[0]) : null;
    }
  }


  const packs = getPacks(trimmed);
  process.env.DEBUG && console.log('packs:', packs);
  if (packs) {
    const match = packs[0].match(/\d+/g);
    const matches = regexps.map((regex) => title.match(new RegExp(regex, 'g')));
    process.env.DEBUG && console.log('matches:', matches);
    const filteredMatches = matches.filter((m) => m && m.length > 0);
    process.env.DEBUG && console.log('filteredMatches:', filteredMatches);
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
    return match ? Number(match[0]) : null;
  }

  const bunch = parsePackQuantity(trimmed);
  process.env.DEBUG && console.log('bunch:', bunch);
  if (bunch) {
    const split = bunch[0].toLocaleLowerCase().split('x');
    const match = split[0].match(/\d+/g);
    return match ? Number(match[0]) : null;
  }

  return null;
};
