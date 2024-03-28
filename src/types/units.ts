export interface MainUnit {
  [key: string]: string[];
}

export interface SiUnits {
  [key: string]: MainUnit;
}

export interface NormalizeMeasure {
  key: string;
  value: number;
  prefix: string;
  originalUnit: string;
  str: string;
}
