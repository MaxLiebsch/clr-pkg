export const RESTART_DELAY = 1;
export const MAX_RESTART_DELAY = 5;
export const MAX_RETRIES = 500;
export const RANDOM_TIMEOUT_MIN = 3000;
export const RANDOM_TIMEOUT_MAX = 8000;
export const MAX_CRITICAL_ERRORS = 15;

//Should be in the middle of the range of RANDOM_TIMEOUT_MIN and RANDOM_TIMEOUT_MAX or not
export const ACCESS_DENIED_FREQUENCE = 10000;
export const STANDARD_FREQUENCE = 10000;

export const CHROME_VERSIONS = [
  '122.0.6261.94',
  '123.0.6312.58',
  '124.0.6367.60',
];

export const uuidRegex =
  /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

export const antiKeywords = [
  'about',
  'about-us',
  'account',
  'disclaimer',
  'unternehmen',
  'anfahrt',
  'preise',
  'agb',
  'allgemeine-geschaeftsbedingungen',
  'arzt',
  'bewertungen',
  'whishlist',
  'cancellation policy',
  'cart',
  'checkout',
  'contact',
  'content',
  'rabatt',
  'customer',
  'dashboard',
  'data protection',
  'datenschutz',
  'faq',
  'haftung',
  'history',
  'impressum',
  'gutscheine',
  'bestellschein',
  'bestellung',
  'imprint',
  'jpeg',
  'jpg',
  'kontakt',
  'legal',
  'legal notice',
  'lieferung',
  'login',
  'magazin',
  'buecher',
  'bücher',
  'main',
  'newsletter',
  'notepad',
  'partner',
  'password',
  'passwort',
  'payment',
  'payments',
  'pdf',
  'png',
  'prescription',
  'privacy',
  'profile',
  'quickorder',
  'adventskalender',
  'glossar',
  'ratgeber',
  'karriere',
  'retoure',
  'freiumschlaege',
  'career',
  'rating',
  'ratings',
  'recommendation',
  'register',
  'registrieren',
  'review',
  'rezept',
  'rezepte',
  'service',
  'shipping',
  'shopping',
  'sitemap',
  'ueber-uns',
  'versand',
  'versandkosten',
  'information',
  'warenkorb',
  'widerrufsbelehrung',
  'widerrufsrecht',
  'wiederuf',
  'zahlung',
  'zahlungen',
];

export const platformStrs = ['macOS', 'Windows', 'Linux'];

export const acceptEncodingList = [
  'gzip, deflate, br',
  'gzip, deflate, br, zstd',
  'gzip, deflate',
  'deflate, gzip, br',
  'gzip, deflate, zstd',
  'br, gzip, deflate',
  'gzip',
  'gzip,deflate',
];

export const languagesLists = [
  ['de-DE', 'de', 'en-US', 'en'],
  ['en-DE', 'de-DE'],
  ['de-DE'],
  ['de'],
  ['de', 'de-DE', 'en', 'en-GB', 'en-US'],
  ['de-CH', 'de-DE', 'de', 'en-US', 'en'],
];

export const languageList = ['de-DE', 'de', 'en-DE', 'de-CH'];

export const timezones = [
  'Europe/Kiev',
  'America/New_York',
  'Europe/Moscow',
  'America/Phoenix',
  'Europe/Lisbon',
  'Europe/Kaliningrad',
  'America/Denver',
  'Europe/Moscow',
  'America/Los_Angeles',
  'Europe/Kaliningrad',
  'America/Chicago',
  'Europe/Moscow',
  "Europe/Lisbon",
];

export const acceptList = [
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  '*/*',
];

export const refererList = [
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.yahoo.com/',
  'https://www.yandex.com/',
  'https://duckduckgo.com/',
  'https://www.ecosia.org/',
  'https://www.ask.com/',
];

export const userAgentList = [
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows 7.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Trailer/93.3.3516.28',
    platformVersion: '15.0.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux i686; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:109.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/115.	0.59',
    platformVersion: '6.1',
  },
  {
    agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Chrome/<version>.0.0.0 Safari/605.1.15',
    platformVersion: '14.4.1',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/<version>.0.2365.113',
    platformVersion: '15.0.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/109.0.1518.14	0.59',
    platformVersion: '6.1',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '15.0.0',
  },
  {
    agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/<version>.0.2365.113',
    platformVersion: '10.15.7',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '14.4.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	34.12',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.0',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	14.12',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	1.18',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/124.	13.53',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 OPR/108.0.0.	0.59',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/<version>.0.0.	12.35',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	0.59',
    platformVersion: '',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	4.71',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/117.0.2045.4	4.12',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 OPR/108.0.0.	2.35',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/121.0.0.	2.35',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/112.0.1722.5	1.76',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/109.0.1518.5	1.18',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	1.18',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/123.	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/109.0.1518.10	0.59',
    platformVersion: '6.1',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Chrome/<version>.0.0.0 Firefox/118.	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.3	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) Chrome/<version>.0.0.0 like Geck	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/107.0.1418.2	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/112.0.1722.3	0.59',
    platformVersion: '10.0',
  },
  {
    agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36 Edg/123.0.0.	0.59',
    platformVersion: '10.0',
  },
];

export const pluginList = [
  {
    '0': {
      type: 'application/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    '1': {
      type: 'text/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    name: 'PDF Viewer',
    description: 'Portable Document Format',
    filename: 'internal-pdf-viewer',
    length: 2,
  },
  {
    '0': {
      type: 'application/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    '1': {
      type: 'text/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    name: 'Chrome PDF Viewer',
    description: 'Portable Document Format',
    filename: 'internal-pdf-viewer',
    length: 2,
  },
  {
    '0': {
      type: 'application/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    '1': {
      type: 'text/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    name: 'Chromium PDF Viewer',
    description: 'Portable Document Format',
    filename: 'internal-pdf-viewer',
    length: 2,
  },
  {
    '0': {
      type: 'application/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    '1': {
      type: 'text/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    name: 'Microsoft Edge PDF Viewer',
    description: 'Portable Document Format',
    filename: 'internal-pdf-viewer',
    length: 2,
  },
  {
    '0': {
      type: 'application/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    '1': {
      type: 'text/pdf',
      suffixes: 'pdf',
      description: 'Portable Document Format',
      enabledPlugin: {
        '0': {
          type: 'application/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
        '1': {
          type: 'text/pdf',
          suffixes: 'pdf',
          description: 'Portable Document Format',
          enabledPlugin: { '0': {}, '1': {} },
        },
      },
    },
    name: 'WebKit built-in PDF',
    description: 'Portable Document Format',
    filename: 'internal-pdf-viewer',
    length: 2,
  },
];

export const voicesList = [
  {
    voiceURI: 'Microsoft George - English (United Kingdom)',
    name: 'Microsoft George - English (United Kingdom)',
    lang: 'en-GB',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google português do Brasil',
    name: 'Google português do Brasil',
    lang: 'pt-BR',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google русский',
    name: 'Google русский',
    lang: 'ru-RU',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Microsoft Hazel - English (United Kingdom)',
    name: 'Microsoft Hazel - English (United Kingdom)',
    lang: 'en-GB',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Microsoft George - English (United Kingdom)',
    name: 'Microsoft George - English (United Kingdom)',
    lang: 'en-GB',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Microsoft Susan - English (United Kingdom)',
    name: 'Microsoft Susan - English (United Kingdom)',
    lang: 'en-GB',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Microsoft David - English (United Kingdom)',
    name: 'Microsoft David - English (United Kingdom)',
    lang: 'en-GB',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Microsoft Zira - English (United States)',
    name: 'Microsoft Zira - English (United States)',
    lang: 'en-US',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google Deutsch',
    name: 'Google Deutsch',
    lang: 'de-DE',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google US English',
    name: 'Google US English',
    lang: 'en-US',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google Nederlands',
    name: 'Google Nederlands',
    lang: 'nl-NL',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google italiano',
    name: 'Google italiano',
    lang: 'it-IT',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google polski',
    name: 'Google polski',
    lang: 'nl-NL',
    localService: true,
    default: false,
  },
  {
    voiceURI: 'Google français',
    name: 'Google français',
    lang: 'fr-FR',
    localService: true,
    default: false,
  },
];

export const screenResolutions = [
  { height: 2880, width: 1800 },
  { height: 2560, width: 1664 },
  { height: 1920, width: 1080 },
  { height: 1440, width: 900 },
  { height: 1280, width: 720 },
  { height: 1536, width: 864 },
  { height: 1366, width: 768 },
  { height: 1600, width: 900 },
  { height: 810, width: 1080 },
];

export const screenResolutionsByPlatform = {
  macOS: [
    { width: 2304, height: 1440 },
    { width: 2880, height: 1800 },
    { width: 2560, height: 1664 },
    { width: 3024, height: 1964 },
  ],
  Windows: [
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 2160, height: 1440 },
    { width: 1280, height: 1024 },
    { width: 1600, height: 1200 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1536, height: 864 },
    { width: 1366, height: 768 },
    { width: 1600, height: 900 },
  ],
  Linux: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1600, height: 1200 },
    { width: 1280, height: 720 },
    { width: 1600, height: 900 },
    { width: 810, height: 1080 },
  ],
};

export const headers_list = [
  {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    Referer: 'https://www.google.com/',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: 'https://www.google.com/',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  {
    Connection: 'keep-alive',
    DNT: '1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
    Referer: 'https://www.google.com/',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  },
  {
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    Referer: 'https://www.google.com/',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
  },
];

export const htmlTemplate = `<html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body></body></html>`;

export const proxies = [
  'atlas.p.shifter.io:10005',
  'atlas.p.shifter.io:10006',
  'atlas.p.shifter.io:10007',
  'atlas.p.shifter.io:10008',
  'atlas.p.shifter.io:10009',
  'atlas.p.shifter.io:10010',
  'atlas.p.shifter.io:10011',
  'atlas.p.shifter.io:10012',
  'atlas.p.shifter.io:10013',
  'atlas.p.shifter.io:10014',
];

export const availability = [
  '2 Tagen',
  'Aktions-Artikel, nicht separat erhältlich',
  'Ausverkauft, derzeit nicht lieferbar',
  'Disapo Express Versand erfolgt innerhalb von 24h',
  'Lieferbar',
  'Lieferzeit 2-3 Werktage',
  'Lieferzeit 3-5 Werktage',
  'Lieferzeit 7-10 Werktage',
  'Lieferzeit Ausverkauft',
  'Lieferzeit Lieferzeit ca. 1-3 Werktage',
  'Lieferzeit Lieferzeit ca. 5-10 Werktage',
  'Lieferzeit Sofort lieferbar',
  'Lieferzeit ca. 1-3 Werktage',
  'Sofort lieferbar',
  'Sofort lieferbar, 1-2 Werktage',
  'Verfügbar in 4 - 6 Tagen',
  'Zeitnah lieferbar',
  'Zur Zeit nicht Lieferbar.',
  'Zur Zeit nicht lieferbar',
  'an Lager',
  'derzeit nicht lieferbar',
  'eingeschränkt lieferbar',
  'in 1 bis 2 Tagen verfügbar',
  'in einigen Tagen verfügbar',
  'nicht lieferbar',
  'sofort lieferbar',
  'sofort verfügbar',
  'verfügbar',
];

export const regexp = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
export const regex = /[^A-Za-z0-9\s,.öäÖÄüÜ\-]/g;
export const pznRegex = /\b[0-9]{7}\b|\b[0-9]{8}\b/;
export const eanRegex = /\b[0-9]{12}\b|\b[0-9]{13}\b/;
