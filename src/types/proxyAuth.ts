export interface ProxyAuth {
  host: string;
  username: string;
  password: string;
}

export type ProxyType = 'de' | 'mix' | 'des';

export type StandardTimeZones = { [key in ProxyType]: string };

export const standardTimeZones: StandardTimeZones = {
  des: 'Europe/Berlin',
  de: 'Europe/Berlin',
  mix: 'America/New_York',
};
