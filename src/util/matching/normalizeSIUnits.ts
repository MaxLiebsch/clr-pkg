import pkg2, { Unit } from 'convert-units';
let convert = pkg2;
import _ from 'underscore';
import { MainUnit, NormalizeMeasure, SiUnits } from '../../types/units';
import units from '../../constants/units.json';

export const numberRegExp = /^([-+])?\d+$/;

export function buildRegexForSiUnits() {
  let pattern = Object.values(units)
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

  return new RegExp(
    `([-+]|Ø\\s*|)\\b\\d+([.,]\\d+)?(\\s*(?:${pattern})|\\s*°)?\\b`,
    'gi',
  );
}

function normalizeNumber(inputNumber: string) {
  let normalized = inputNumber.replace(',', '.');
  if (/\.\d{3}$/.test(normalized) || /\.\d{3}\s/.test(normalized)) {
    normalized = normalized.replace('.', '');
  }
  return parseFloat(normalized);
}

function buildRegexFromUnits(units: MainUnit) {
  let pattern = Object.values(units)
    .flatMap((units) => units)
    .join('|');
  return new RegExp(`(Ø\\s*)?([-+]?\\d+(?:[.,]\\d+)?)\\s*(${pattern})\\b`, 'i');
}

export function normalizeMeasurement(
  input: string,
  units: MainUnit,
  category: string,
) {
  if (new RegExp(numberRegExp).test(input)) {
    const match = input.match(numberRegExp);
    if (match)
      return {
        key: 'angle.degree',
        value: parseFloat(match[0]),
        prefix: match[1] ? match[1] : '',
        originalUnit: '°',
        str: ''
      };
  }

  const regex = buildRegexFromUnits(units);
  const match = input.toLowerCase().match(regex);
  if (match) {
    const value = normalizeNumber(match[2]);
    const unit = match[3].toLowerCase();
    let prefix = '';
    for (const [key, values] of Object.entries(units)) {
      if (values.map((v) => v.toLowerCase()).includes(unit)) {
        if (match[2].startsWith('+')) {
          prefix = '+';
        }
        if (match[2].startsWith('-')) {
          prefix = '-';
        }
        if (match.input?.startsWith('ø')) {
          return {
            key: `geometry.diameter`,
            value,
            prefix,
            originalUnit: match[3],
            str: ''
          };
        }
        if (match.input?.includes('MHz')) {
          return {
            key: `${category}.megahertz`,
            value,
            prefix,
            originalUnit: match[3],
            str: ''
          };
        }
        if (match.input?.includes('Mhz')) {
          return {
            key: `${category}.megahertz`,
            value,
            prefix,
            originalUnit: match[3],
            str: ''
          };
        }
        return {
          key: `${category}.${key}`,
          value,
          prefix,
          originalUnit: match[3],
          str: ''
        };
      }
    }
  }
  return null;
}

export const classifyMeasurements = (measures: string[]) => {
return  measures.map((measure) => {
    const _units = Object.entries(units);
    for (let index = 0; index < _units.length; index++) {
      const [key, magnitudeStrs] = _units[index];
      const classified = normalizeMeasurement(measure, magnitudeStrs, key);
      if (classified) {
        return classified;
      }
    }
  }).filter(classifiedMeasurement => classifiedMeasurement) as NormalizeMeasure[]
  
};

export function levelNormalizedMeasurements(
  normalizeMeasurements: NormalizeMeasure[],
) {
  return normalizeMeasurements.map((measurement) => {

    const objectPath = measurement.key.split('.');
    const fromUnit = (_.get(units, objectPath) as Unit[])[0];
    const fieldUnit = _.get(units, objectPath[0],{});
    const keys = Object.keys(fieldUnit);
    type Keys = keyof typeof fieldUnit
    const key = keys[0] as Keys
    const toUnit = fieldUnit[key][0];
    try {
      const _toUnit = toUnit == 'nm' ? 'mm' : toUnit;
      const best = convert(measurement.value).from(fromUnit).to(_toUnit);
      return {
        key: measurement.key,
        value: best,
        prefix: measurement.prefix,
        unit: _toUnit,
        str: `${best} ${_toUnit}`,
      };
    } catch (error) {
      return {
        ...measurement,
        str: `${measurement.prefix}${measurement.value} ${toUnit}`,
      };
    }

  });
}
