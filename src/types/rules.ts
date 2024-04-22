export interface Conditon {
  type: string;
  value: string;
}

export interface Rule {
  action: string;
  conditions: Conditon[];
  description: string;
}
