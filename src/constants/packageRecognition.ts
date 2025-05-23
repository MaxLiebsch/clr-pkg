export const piecesStrings = [
  'Stk\\.',
  'Pck\\b',
  'Stück(\\b|$)',
  'St\\.',
  'Tabs',
  'stck(\\b|$)',
  'Stck(\\b|$)',
  'Stck\\.(\\b|$)',
  'Stk',
  'St\\b',
  'Dosen',
  'Kaffeepads',
  'Dragrees',
  'Ersatzklingen',
  'Riegel',
  'Teststreifen',
  'Fallen',
  'Windeln',
  'Höschenwindeln',
  'Babywindeln',
  'Pyjama Höschen',
];

export const packStrings = [
  'Pack',
  'Sparpack',
  'Set(?!,)',
  'Packung',
  'Blister',
  'VE\\b',
  'Verkleidung',
  'Packungen',
  'Beutel',
  'Portionen',
  'Package',
  'Pcs',
  'pcs',
  'Pc\\(S\\)',
  'Pieces',
  'pieces',
  'pices',
  'Pices',
  'Satz',
  'Pc s ',
  'Counts',
  'Count',
  'Kameras',
  'Kapseln',
];

export const packNegations = ['inkl\\.\\s'];

export const xTimesNegations = [
  '\\d',
  'PCIe',
  'pcie',
  'Strom',
  'strom',
  '\\sMiMo',
  '\\sMIMO',
  'usb',
  'USB',
  'LED',
  'Zoom',
  'zoom',
  'Lumen',
  'lan',
  'E2000',
  'Schutzkontakt',
  '\\sPort',
  '(\\s|)Gbit',
  '(\\s|)GHz',
  '(\\s|)GB',
  '(\\s|)RS232',
  '(\\s|)Gb',
  'Cam-In',
  '-',
  'PD',
  'CEE',
  ',',
  '/',
  'AA',
  'AAA',
  '(\\s|)W\\b',
  'A\\b',
  'LAN',
  'led',
  'max',
  'HDMI',
  'hdmi',
  'displayport',
  'Displayport',
  'DisplayPort',
  'rj',
  'RJ',
  'lc-d',
  'LC-D',
  'PoE',
  'SFP',
  'sfp',
];

export const exceptionsStrings = ['Flaschen'];

export const specialKeywords = [
  { key: 'doppelpack', size: 2 },
  { key: 'dreierpack', size: 3 },
  { key: 'viererpack', size: 4 },
  { key: 'sechserpack', size: 6 },
  { key: 'achterpack', size: 8 },
];
