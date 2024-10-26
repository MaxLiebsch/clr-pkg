export interface ProxyAuth {
  host: string;
  username: string;
  password: string;
}

export type ProxyType = 'de' | 'mix' | 'de-p';

export type StandardTimeZones = { [key in ProxyType]: string };

export const standardTimeZones: StandardTimeZones = {
  'de-p': 'Europe/Berlin',
  de: 'Europe/Berlin',
  mix: 'America/New_York',
};
