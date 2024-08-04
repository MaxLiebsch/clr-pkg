import {
  AznMonthlySalesCoefficients,
  Categories,
} from '../types/aznSalesRankCoefficients';

const aznMonthlySalesCoefficients: AznMonthlySalesCoefficients = {
  'Auto & Motorrad': { a: 465.43, b: -0.000204 },
  Baby: { a: 513.89, b: -0.000339 },
  Baumarkt: { a: 1146.32, b: -0.000154 },
  Beleuchtung: { a: 325.12, b: -0.000242 },
  'Bürobedarf & Schreibwaren': { a: 928.46, b: -0.000251 },
  'Computer & Zubehör': { a: 870.82, b: -0.000246 },
  'Drogerie & Körperpflege': { a: 2206.24, b: -0.000246 },
  'Elektro-Großgeräte': { a: 122.13, b: -0.000378 },
  'Elektronik & Foto': { a: 1779.21, b: -0.000244 },
  Garten: { a: 1312.19, b: -0.000211 },
  'Gewerbe, Industrie & Wissenschaft': { a: 280.42, b: -0.00026 },
  Haustier: { a: 622.94, b: -0.000227 },
  'Kamera & Foto': { a: 122.13, b: -0.000378 },
  'Koffer, Rucksäcke & Taschen': { a: 324.13, b: -0.000271 },
  Kosmetik: { a: 874.42, b: 0.000182 },
  'Küche, Haushalt & Wohnen': { a: 1979.12, b: -0.000143 },
  'Lebensmittel & Getränke': { a: 703.35, b: -0.000199 },
  'Musikinstrumente & DJ-Equipment': { a: 52, b: -0.0000786 },
  Schmuck: { a: 169.89, b: -0.000211 },
  'Schuhe & Handtaschen': { a: 447.14, b: -0.001849 },
  Spielzeug: { a: 1065.51, b: -0.000164 },
  'Sport & Freizeit': { a: 988.54, b: -0.000184 },
  Uhren: { a: 510.65, b: -0.001116 },
};

export const getCoefficients = (category: Categories) => {
  return aznMonthlySalesCoefficients[category];
};
