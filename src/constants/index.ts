import { Versions, puppeteerVersions } from '../util/versionProvider';

export const RESTART_DELAY = 1;
export const MAX_RESTART_DELAY = 5;
export const MAX_RETRIES = 500;
export const MAX_RETRIES_NOT_FOUND = 2;
export const RANDOM_TIMEOUT_MIN = 3000;
export const RANDOM_TIMEOUT_MAX = 8000;
export const RECURSIVE_BUTTON_SAFEGUARD = 10; // 10 * 16 = 160 shops should be enough...
export const MAX_CRITICAL_ERRORS = 7;
export const DEFAULT_PAGE_TIMEOUT = 60000;
export const EAN_PAGE_TIMEOUT = 120000;
export const amazonTransportFee = 0.25;
export const MAX_RETRIES_LOOKUP_EAN = 1;
export const SAVE_USAGE_INTERVAL = 1000 * 60 * 5; // 5 minutes
export const MINIMUM_PENDING_PRODUCTS = 1;

//Should be in the middle of the range of RANDOM_TIMEOUT_MIN and RANDOM_TIMEOUT_MAX or not
export const ACCESS_DENIED_FREQUENCE = 10000;
export const STANDARD_FREQUENCE = 10000;

export const CHROME_VERSIONS: Versions[] = Object.keys(
  puppeteerVersions,
) as Versions[];

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
  ['de', 'de-AT'],
  ['de', 'de-DE'],
  ['de-CH', 'de'],
];

export const languageList = [
  'de-AT',
  'de-DE',
  'de-CH',
  // 'de'
  // 'de-CH', 'de-AT'
];

export const timezones = [
  'Europe/Kiev',
  'America/New_York',
  'Europe/Amsterdam',
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
  'Europe/Lisbon',
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

export const graphicsCardListByPlatform = {
  Windows: [
    { renderer: 'Intel Iris OpenGL Engine', vendor: 'Intel Inc.' },
    {
      renderer:
        'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)f',
      vendor: 'Google Inc. (Intel)',
    },
    {
      renderer: 'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)',
      vendor: 'Google Inc.',
    },
    {
      renderer: 'ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
      vendor: 'Google Inc. (Intel)',
    },
    {
      renderer:
        'ANGLE (AMD, AMD Readon (TM) R9 390 Series (0x00006781) Direct3011 vs_5_0 ps_5_0, D3D11)',
      vendor: 'Google Inc. (AMD)',
    },
    {
      renderer:
        'ANGLE (NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      vendor: 'Google Inc. (NVIDIA)',
    },
    // {
    //   renderer: 'NVIDIA GeForce RTX 2080 Ti/PCIe/SSE2',
    //   vendor: 'NVIDIA Corporation',
    // },
    // { renderer: 'AMD Radeon RX 580', vendor: 'Advanced Micro Devices, Inc.' },
    // {
    //   renderer: 'AMD Radeon Vega 8 Graphics',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // { renderer: 'Intel Iris Plus Graphics 640', vendor: 'Intel Inc.' },
    // { renderer: 'Intel HD Graphics 620', vendor: 'Intel Inc.' },
  ],
  Linux: [
    // {
    //   renderer: 'Mesa DRI Intel HD Graphics 630 (Kaby Lake GT2)',
    //   vendor: 'Intel Open Source Technology Center',
    // },
    // {
    //   renderer: 'Mesa DRI Intel Iris Pro Graphics 580 (Skylake GT4e)',
    //   vendor: 'Intel Open Source Technology Center',
    // },
    // {
    //   renderer: 'Mesa DRI Intel UHD Graphics 620 (Whiskey Lake 3x8 GT2)',
    //   vendor: 'Intel Open Source Technology Center',
    // },
    // {
    //   renderer: 'NVIDIA GeForce GTX 1080/PCIe/SSE2',
    //   vendor: 'NVIDIA Corporation',
    // },
    // {
    //   renderer: 'NVIDIA GeForce RTX 2080 Ti/PCIe/SSE2',
    //   vendor: 'NVIDIA Corporation',
    // },
    // {
    //   renderer:
    //     'AMD Radeon RX 580 (POLARIS10, DRM 3.35.0, 5.4.0-42-generic, LLVM 10.0.0)',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // {
    //   renderer:
    //     'AMD Radeon Vega 8 Graphics (RAVEN, DRM 3.27.0, 4.19.0-6-amd64, LLVM 7.0.1)',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // {
    //   renderer:
    //     'Radeon RX 560 Series (POLARIS11, DRM 3.40.0, 5.7.8, LLVM 10.0.0)',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    {
      renderer: 'Mesa DRI Intel HD Graphics 630 (Kaby Lake GT2)',
      vendor: 'Goolgle Inc. (Intel)',
    },
    {
      vendor: 'Goolgle Inc. (Intel)',
      renderer:
        'ANGLE (Intel, Mesa Intel(R) HD Graphics 4000 (IVB GT2), OpenGL ES 3.0)',
    },
    {
      renderer: 'Mesa DRI Intel Iris Plus Graphics 640 (Ice Lake 8x8 GT2)',
      vendor: 'Goolgle Inc. (Intel)',
    },
  ],
  macOS: [
    // { renderer: 'Intel Iris Plus Graphics 640', vendor: 'Intel Inc.' },
    // { renderer: 'Intel UHD Graphics 617', vendor: 'Intel Inc.' },
    // {
    //   renderer: 'AMD Radeon Pro 560X OpenGL Engine',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // {
    //   renderer: 'AMD Radeon Pro 555X OpenGL Engine',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // {
    //   renderer: 'AMD Radeon RX 580 OpenGL Engine',
    //   vendor: 'Advanced Micro Devices, Inc.',
    // },
    // { renderer: 'Intel Iris Plus Graphics 650', vendor: 'Intel Inc.' },
    // { renderer: 'Intel HD Graphics 6000', vendor: 'Intel Inc.' },
    // { renderer: 'Intel Iris Graphics 6100', vendor: 'Intel Inc.' },
    // { renderer: 'Intel Iris Pro Graphics 5200', vendor: 'Intel Inc.' },
    // {
    //   renderer: 'NVIDIA GeForce GT 750M OpenGL Engine',
    //   vendor: 'NVIDIA Corporation',
    // },
    // { renderer: 'Apple M1', vendor: 'Apple Inc.' },
    {
      renderer:
        'ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)',
      vendor: 'Google Inc. (Apple)',
    },
  ],
};

export const userAgentList = [
  {
    agent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version>.0.0.0 Safari/537.36',
    platformVersion: '',
  },
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
    { width: 2560, height: 1440 },
    { width: 1920, height: 1080 },
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
    { width: 1600, height: 1200 },
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
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

export const aznNotFoundText = 'Ihre Produktsuche hat keine Treffer ergeben';
export const aznNoFittingText =
  'Keine passenden Produkte gefunden. Aktualisieren Sie die Seite oder versuchen Sie es später erneut.';
export const ebyNotFoundText = 'Keine exakten Treffer gefunden';
export const aznUnexpectedErrorText = 'Ein unerwarteter Fehler ist aufgetreten';

export const regexp = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
export const regex = /[^A-Za-z0-9\s,.öäÖÄüÜ\-]/g;
export const pznRegex = /\b[0-9]{7}\b|\b[0-9]{8}\b/;
export const eanRegex = /\b[0-9]{12}\b|\b[0-9]{13}\b/;
