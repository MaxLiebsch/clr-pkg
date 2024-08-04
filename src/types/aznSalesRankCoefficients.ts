export type Categories =
  | 'Auto & Motorrad'
  | 'Baby'
  | 'Baumarkt'
  | 'Beleuchtung'
  | 'Bürobedarf & Schreibwaren'
  | 'Computer & Zubehör'
  | 'Drogerie & Körperpflege'
  | 'Elektro-Großgeräte'
  | 'Elektronik & Foto'
  | 'Garten'
  | 'Gewerbe, Industrie & Wissenschaft'
  | 'Haustier'
  | 'Kamera & Foto'
  | 'Koffer, Rucksäcke & Taschen'
  | 'Kosmetik'
  | 'Küche, Haushalt & Wohnen'
  | 'Lebensmittel & Getränke'
  | 'Musikinstrumente & DJ-Equipment'
  | 'Schmuck'
  | 'Schuhe & Handtaschen'
  | 'Spielzeug'
  | 'Sport & Freizeit'
  | 'Uhren';

export type AznMonthlySalesCoefficients = {
  [key in Categories]: Coefficients;
};

export interface Coefficients {
  a: number;
  b: number;
}