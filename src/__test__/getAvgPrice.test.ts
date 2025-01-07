import { describe, expect, test } from '@jest/globals';
import { determineAdjustedSellPrice } from '../util/getAznAvgPrice';
import { ObjectId } from 'mongodb';
import { AVG_PRICES } from '../types/DbProductRecord';

describe('Get Azn Avg Price', () => {
  test('that avg field is avg30_buyBoxPrice', async () => {
    const product: any = {
      _id: new ObjectId('61f7b1b2b3b3b3b3b3b3b3b3'),
      lnk: 'https://www.idealo.de/preisvergleich/OffersOfProduct/201386574_-translator-m3-green-forest-vasco-electronics.html',
      createdAt: '2024-07-08T03:15:54.184Z',
      ctgry: ['Übersetzer'],
      eanList: ['5903111339883'],
      img: 'https://cdn.idealo.com/folder/Product/201386/5/201386574/s1_produktbild_gross/vasco-translator-m3-green-forest.jpg',
      mnfctr: 'Vasco',
      nm: 'Translator M3 Green Forest',
      prc: 199,
      updatedAt: '2025-01-03T15:46:50.145Z',
      qty: 1,
      s_hash: '0cde216536f61211628340ffc6d6f104',
      uprc: 199,
      eanUpdatedAt: '2024-08-19T00:04:17.837Z',
      ean_prop: 'found',
      sku: '5903111339883',
      cur: 'EUR',
      hasMnfctr: false,
      a: 'sofort lieferbar',
      nm_v: 'v01',
      nm_updatedAt: '2024-12-15T22:28:01.508Z',
      qty_v: 'v05',
      nm_vrfd: {
        qty_prop: 'complete',
        qty_score: 0.95,
      },
      qty_updatedAt: '2024-12-16T10:06:01.665Z',
      availUpdatedAt: '2025-01-01T22:45:31.049Z',
      sdmn: 'idealo.de',
      a_qty: 1,
      anhstprcs: [
        [1722874680, 29900],
        [1726833960, 22900],
      ],
      asin: 'B08NCBQ9HV',
      avg30_ansprcs: 22900,
      avg30_salesRank: 4887,
      avg90_ansprcs: 22900,
      avg90_salesRank: 5213,
      brand: 'Vasco Electronics',
      categories: [15821011],
      categoryTree: [
        {
          catId: 192416031,
          name: 'Bürobedarf & Schreibwaren',
        },
        {
          catId: 197754031,
          name: 'Büroelektronik',
        },
        {
          catId: 15821011,
          name: 'Sprachübersetzer',
        },
      ],
      costs: {
        prvsn: 7,
        ktpt: 3.43,
        azn: 16.03,
        varc: 0,
        strg_1_hy: 0.03894,
        strg_2_hy: 0.0599,
        tpt: 3.42,
        estmtd: false,
        dfltTpt: false,
        noStrgFee: false,
      },
      curr_ansprcs: 22900,
      curr_salesRank: 4547,
      drops30: 32,
      drops90: 114,
      iwhd: {
        height: 125,
        length: 49,
        width: 13,
        weight: 88,
      },
      k_eanList: ['5903111339883'],
      keepaEanUpdatedAt: '2024-12-05T15:53:00.954Z',
      monthlySold: 267,
      pwhd: {
        height: 66,
        length: 170,
        width: 126,
        weight: 330,
      },
      salesRanks: {
        '15821011': [
          [1727661600, 2],
          [1728153960, 1],
          [1728402720, 4],
          [1728851880, 3],
          [1728984000, 3],
          [1729176480, 4],
          [1729387680, 4],
          [1729854360, 2],
          [1730031840, 2],
          [1730392560, 2],
          [1730596080, 4],
          [1730854920, 3],
          [1731101880, 1],
          [1731347760, 3],
          [1731563880, 3],
          [1731764160, 1],
          [1732059600, 1],
          [1732382880, 3],
          [1732595760, 4],
          [1732762560, 7],
          [1732930560, 6],
          [1733103840, 10],
          [1733436240, 7],
          [1733629920, 6],
          [1733846880, 9],
          [1734037920, 5],
          [1734137160, 6],
          [1734315480, 10],
          [1734492000, 8],
          [1734725160, 8],
          [1734824400, 7],
          [1735003680, 6],
          [1735257120, 7],
          [1735438320, 5],
          [1735610400, 5],
        ],
        '192416031': [
          [1728033360, 4325],
          [1728113040, 7125],
          [1728193680, 2982],
          [1728299640, 2947],
          [1728402720, 4810],
          [1728516840, 3998],
          [1728618960, 3283],
          [1728747480, 3252],
          [1728851880, 5544],
          [1728958080, 8196],
          [1729086240, 7562],
          [1729212480, 6414],
          [1729296000, 6961],
          [1729387680, 7703],
          [1729516320, 6170],
          [1729644480, 6960],
          [1729749480, 7739],
          [1729822560, 5701],
          [1729944240, 3900],
          [1730062560, 3210],
          [1730171280, 3216],
          [1730257200, 5270],
          [1730343600, 4198],
          [1730421480, 6519],
          [1730596080, 6840],
          [1730761800, 4115],
          [1730880960, 7612],
          [1731024480, 4842],
          [1731176880, 5046],
          [1731347760, 5641],
          [1731507000, 5904],
          [1731600000, 4880],
          [1731683040, 5835],
          [1731764160, 4336],
          [1731853440, 4428],
          [1731990000, 5892],
          [1732133520, 4454],
          [1732249440, 5283],
          [1732422480, 4702],
          [1732578720, 5991],
          [1732742040, 5981],
          [1732850880, 7776],
          [1732988640, 4607],
          [1733190480, 7386],
          [1733366040, 4123],
          [1733553120, 5519],
          [1733798880, 5820],
          [1733919960, 4680],
          [1734053040, 5374],
          [1734175200, 5503],
          [1734315480, 5949],
          [1734453720, 3918],
          [1734578160, 5679],
          [1734658680, 5052],
          [1734807360, 4531],
          [1734952200, 4296],
          [1735180920, 3747],
          [1735293120, 3718],
          [1735438320, 4510],
          [1735556520, 4892],
          [1735784280, 4955],
        ],
      },
      totalOfferCount: 1,
      a_img:
        'https://m.media-amazon.com/images/I/61B64PW4BGL.__AC_SX300_SY300_QL70_ML2_.jpg',
      a_mrgn: 5.72,
      a_mrgn_pct: 2.5,
      a_nm: 'Vasco Translator M3 Sprachübersetzer | Übersetzungsgerät | Übersetzt lebenslang gratis | 70+ Sprachen | Spracheingabe und Sprachausgabe | Foto Übersetzer | Farbe: Green Forest',
      a_orgn: 'a',
      a_p_mrgn: 5.47,
      a_p_mrgn_pct: 2.39,
      a_p_w_mrgn: 5.45,
      a_p_w_mrgn_pct: 2.38,
      a_pblsh: true,
      a_prc: 229,
      a_rating: 3.9,
      a_reviewcnt: 1499,
      a_uprc: 229,
      a_useCurrPrice: true,
      a_vrfd: {
        vrfd: false,
        vrfn_pending: true,
        flags: [],
        flag_cnt: 0,
        nm_prop: 'complete',
        score: 0.9,
        isMatch: true,
        qty_prop: 'complete',
        qty_score: 0.95,
      },
      a_w_mrgn: 5.7,
      a_w_mrgn_pct: 2.49,
      bsr: [
        {
          category: 'Bürobedarf & Schreibwaren',
          number: 4388,
          createdAt: '2024-12-06T20:25:21.928Z',
        },
      ],
      buyBoxIsAmazon: false,
      dealAznUpdatedAt: '2025-01-02T23:03:39.791Z',
      infoUpdatedAt: '2024-12-06T20:25:21.928Z',
      info_prop: 'complete',
      tax: 19,
      keepaUpdatedAt: '2025-01-02T16:55:33.787Z',
      a_cur: 'EUR',
      gl: 'gl_electronics',
      avg30_buyBoxPrice: 22900,
      avg90_buyBoxPrice: 22900,
      curr_buyBoxPrice: 22900,
      catUpdatedAt: '2025-01-03T15:43:12.748Z',
      cat_prop: 'ean_missing',
      e_img: 'https://i.ebayimg.com/images/g/t6sAAOSwf~lmA~iS/s-l500.webp',
      e_nm: 'Vasco Translator M3 | 76 Sprachen Übersetzer | Foto Übersetzer | 0,- Folgekosten',
      e_orgn: 'e',
      e_pRange: {
        min: 249,
        max: 249,
        median: 249,
      },
      e_pblsh: false,
      e_prc: 249,
      e_qty: 1,
      e_totalOfferCount: 1,
      e_uprc: 249,
      eby_prop: 'complete',
      esin: '294980222754',
      qEbyUpdatedAt: '2025-01-03T15:46:50.141Z',
    };

    const { avgField, avgPrice, a_useCurrPrice } = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg30_buyBoxPrice);
    expect(avgPrice).toBe(product.avg30_buyBoxPrice / 100);
    expect(a_useCurrPrice).toBe(false);
  });
  test('that avg field is avg30_anprcs', async () => {
    const product: any = {
      _id: {
        $oid: '668b5a2dd63905fe52162cd6',
      },
      lnk: 'https://www.idealo.de/preisvergleich/OffersOfProduct/5146728_-smart-inverter-mh6565cps-lg-electronics.html',
      createdAt: '2024-07-08T03:17:01.387Z',
      ctgry: ['Mikrowellen'],
      eanList: ['8801031522682'],
      img: 'https://cdn.idealo.com/folder/Product/5146/7/5146728/s1_produktbild_mittelgross/lg-smart-inverter-mh6565cps.jpg',
      mnfctr: 'LG',
      nm: 'Smart Inverter MH6565CPS',
      prc: 179.99,
      updatedAt: '2024-12-31T00:36:35.407Z',
      qty: 1,
      s_hash: '1fa9fb3a1f7a8dd19283416640656399',
      uprc: 179.99,
      eanUpdatedAt: '2024-08-19T00:13:36.289Z',
      ean_prop: 'found',
      sku: '8801031522682',
      cur: 'EUR',
      hasMnfctr: false,
      a: 'sofort lieferbar',
      availUpdatedAt: '2024-11-07T20:02:04.263Z',
      ahstprcs: [
        [1727524800, 15999],
        [1729768560, 17999],
        [1730465040, 17999],
        [1730844480, 17999],
        [1732007280, 19610],
        [1732275600, 15900],
        [1734259080, 17499],
      ],
      anhstprcs: [
        [1726995360, 15990],
        [1729091520, 15990],
        [1730125560, 17999],
        [1731745440, 19575],
        [1732151040, 15900],
        [1734259080, 17499],
      ],
      asin: 'B01LBIZ7AC',
      auhstprcs: [
        [1727176440, -1],
        [1728818160, 12336],
        [1730190000, 17279],
        [1731291840, 14581],
        [1732494720, 15264],
        [1732825200, 16871],
        [1733335200, 17184],
        [1734532320, 14502],
      ],
      availabilityAmazon: 0,
      avg30_ahsprcs: 17912,
      avg30_ansprcs: 17912,
      avg30_ausprcs: 15275,
      avg30_salesRank: 3585,
      avg90_ahsprcs: 17504,
      avg90_ansprcs: 17299,
      avg90_ausprcs: 14468,
      avg90_salesRank: 3653,
      brand: 'LG',
      buyBoxIsAmazon: true,
      categories: [3495048031, 16075741, 11256730031, 12725707031, 8362475031],
      categoryTree: [
        {
          catId: 3167641,
          name: 'Küche, Haushalt & Wohnen',
        },
        {
          catId: 3169321,
          name: 'Elektrische Küchengeräte',
        },
        {
          catId: 3310811,
          name: 'Mikrowellen',
        },
        {
          catId: 3495048031,
          name: 'Mikrowellen mit Grill',
        },
      ],
      curr_ahsprcs: 17999,
      curr_ansprcs: 17999,
      curr_ausprcs: 14325,
      curr_salesRank: 2292,
      k_eanList: ['8801031522682'],
      keepaEanUpdatedAt: '2024-12-28T03:12:44.713Z',
      monthlySold: 100,
      numberOfItems: 1,
      salesRanks: {
        '3167641': [
          [1727574720, 4647],
          [1727716800, 4383],
          [1727888400, 2597],
          [1728032880, 2416],
          [1728195600, 2060],
          [1728398640, 1813],
          [1728594360, 2985],
          [1728743760, 3960],
          [1728881760, 4141],
          [1729026240, 3892],
          [1729156800, 3859],
          [1729285680, 4996],
          [1729465920, 6473],
          [1729606560, 6566],
          [1729759920, 4437],
          [1729914240, 3571],
          [1730125560, 3335],
          [1730286960, 2283],
          [1730453640, 3033],
          [1730634960, 2778],
          [1730844480, 4489],
          [1731017160, 5178],
          [1731202320, 4326],
          [1731380640, 3059],
          [1731535560, 4407],
          [1731727200, 4684],
          [1731910560, 6784],
          [1732091160, 5294],
          [1732226760, 927],
          [1732356720, 1358],
          [1732514400, 2004],
          [1732674960, 2606],
          [1732825200, 3027],
          [1732962000, 1985],
          [1733105520, 2425],
          [1733243400, 2599],
          [1733408400, 2879],
          [1733577360, 2779],
          [1733722800, 3136],
          [1733881920, 3459],
          [1734055200, 2940],
          [1734194760, 3054],
          [1734339120, 3755],
          [1734509160, 4206],
          [1734665280, 4825],
          [1734800160, 7097],
          [1734931440, 4220],
          [1735072200, 4223],
          [1735217160, 3964],
        ],
        '16075741': [
          [1727574720, 139],
          [1727742480, 118],
          [1727898720, 75],
          [1728038400, 76],
          [1728229080, 61],
          [1728414240, 74],
          [1728621000, 84],
          [1728792720, 93],
          [1728939960, 100],
          [1729080120, 78],
          [1729191120, 103],
          [1729341360, 138],
          [1729544760, 150],
          [1729670760, 126],
          [1729817160, 105],
          [1730002200, 114],
          [1730219760, 84],
          [1730357640, 53],
          [1730557200, 69],
          [1730758080, 79],
          [1730942160, 135],
          [1731135720, 70],
          [1731320160, 82],
          [1731509760, 65],
          [1731705720, 88],
          [1731879360, 140],
          [1732061880, 85],
          [1732209120, 20],
          [1732399680, 44],
          [1732593960, 39],
          [1732770240, 52],
          [1732928160, 56],
          [1733077200, 71],
          [1733225760, 36],
          [1733369040, 40],
          [1733564880, 46],
          [1733805600, 40],
          [1733966400, 44],
          [1734157080, 31],
          [1734313200, 38],
          [1734484800, 62],
          [1734665280, 65],
          [1734817680, 86],
          [1734949200, 76],
          [1735103760, 92],
          [1735269600, 79],
        ],
        '3495048031': [
          [1727569680, 5],
          [1727716800, 7],
          [1728068640, 7],
          [1728289680, 4],
          [1728498480, 11],
          [1728818160, 11],
          [1729017600, 10],
          [1729158960, 12],
          [1729372080, 11],
          [1729589400, 22],
          [1729768560, 16],
          [1729962000, 7],
          [1730274120, 9],
          [1730484240, 12],
          [1730716560, 10],
          [1730928960, 12],
          [1731190080, 7],
          [1731423960, 11],
          [1731637920, 10],
          [1731910560, 12],
          [1732165920, 12],
          [1732458960, 15],
          [1732788720, 22],
          [1732928160, 38],
          [1733089200, 46],
          [1733271000, 28],
          [1733474880, 28],
          [1733678040, 22],
          [1733856480, 24],
          [1734011520, 16],
          [1734223200, 11],
          [1734472080, 21],
          [1734651840, 10],
          [1734843600, 17],
          [1735022400, 21],
          [1735253760, 23],
        ],
      },
      stockAmount: null,
      stockBuyBox: null,
      totalOfferCount: 16,
      keepaUpdatedAt: '2024-10-17T16:21:27.923Z',
      a_img: 'https://m.media-amazon.com/images/I/314SovA2wSL._SL120_.jpg',
      a_mrgn: -35.66,
      a_mrgn_pct: -19.81,
      a_nm: 'LG Electronics NeoChef MH 6565 CPS Mikrowelle / 1000W / Quarz Grill / 25 L / edelstahl',
      a_orgn: 'a',
      a_p_mrgn: -35.91,
      a_p_mrgn_pct: -19.95,
      a_p_w_mrgn: -36.46,
      a_p_w_mrgn_pct: -20.26,
      a_pblsh: true,
      a_prc: 179.99,
      a_qty: 1,
      a_uprc: 179.99,
      a_vrfd: {
        vrfd: false,
        vrfn_pending: true,
        flags: [],
        flag_cnt: 0,
      },
      a_w_mrgn: -36.21,
      a_w_mrgn_pct: -20.12,
      aznUpdatedAt: '2024-12-28T03:15:24.728Z',
      bsr: [
        {
          createdAt: '2024-12-28T03:15:24.700Z',
          category: 'Küche, Haushalt & Wohnen',
          number: 2292,
        },
      ],
      costs: {
        azn: 27,
        varc: 0,
        strg_1_hy: 1.42,
        strg_2_hy: 1.97,
        tpt: 7.24,
        prvsn: 15,
        ktpt: 7.25,
      },
      tax: 19,
      sdmn: 'idealo.de',
      a_cur: 'EUR',
      a_useCurrPrice: true,
      a_rating: 4,
      a_reviewcnt: 535,
      cmpPrcThrshld: 17999,
      drops30: 101,
      drops90: 271,
      iwhd: {
        height: 272,
        length: 389,
        width: 476,
        weight: 10000,
      },
      pwhd: {
        height: 310,
        length: 550,
        width: 420,
        weight: 12580,
      },
      infoUpdatedAt: '2024-12-28T03:15:24.728Z',
      info_prop: 'complete',
      catUpdatedAt: '2024-12-29T03:52:37.701Z',
      cat_prop: 'ean_missmatch',
      e_img: 'https://i.ebayimg.com/images/g/kP8AAOSwuShnSfX6/s-l500.webp',
      e_nm: 'Mikrowelle, Microwave, Mikrowellenofen, Mikrowellengerät, 1000 W, LG Electronics',
      e_orgn: 'e',
      e_pRange: {
        min: 149.99,
        max: 189,
        median: 159,
      },
      e_pblsh: false,
      e_prc: 149.99,
      e_qty: 1,
      e_totalOfferCount: 5,
      e_uprc: 149.99,
      eby_prop: 'complete',
      esin: '156550752732',
      qEbyUpdatedAt: '2024-12-29T04:20:53.520Z',
    };

    const { avgField, avgPrice,a_useCurrPrice } = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg30_ansprcs);
    expect(avgPrice).toBe(product.avg30_ansprcs / 100);
    expect(a_useCurrPrice).toBe(false);
  });
  test('that avg field is avg30_ahprcs', async () => {
    const product: any = {
        "_id": {
          "$oid": "66bcfc86d63905fe524afe82"
        },
        "lnk": "https://www.idealo.de/preisvergleich/OffersOfProduct/5756366_-ec-xt-m-fujifilm.html",
        "createdAt": "2024-08-14T18:50:46.306Z",
        "ctgry": [
          "Elektroartikel",
          "Augenmuscheln"
        ],
        "e_img": "https://i.ebayimg.com/images/g/hw0AAOSw2CZg5qYc/s-l500.webp",
        "e_nm": "FUJIFILM EC-XT M eyecup, Augenmuschel für X-T1, 2, 3, GFX 50S * Fotofachhändler*",
        "e_orgn": "e",
        "e_pblsh": false,
        "e_prc": 17.95,
        "e_qty": 1,
        "e_uprc": 17.95,
        "e_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0
        },
        "eanList": [
          "4547410357509"
        ],
        "esin": "364608991828",
        "img": "https://cdn.idealo.com/folder/Product/5756/3/5756366/s1_produktbild_gross/fujifilm-ec-xt-m.jpg",
        "mnfctr": "Fujifilm",
        "nm": "EC-XT M",
        "prc": 13.79,
        "qty": 1,
        "s_hash": "6c2eae43bbbbf434230a4144637e5265",
        "updatedAt": "2024-12-25T18:25:55.707Z",
        "uprc": 13.79,
        "e_costs": 1.97,
        "e_mrgn": 1.52,
        "e_mrgn_pct": 8.47,
        "e_ns_costs": 1.97,
        "e_ns_mrgn": 1.52,
        "e_ns_mrgn_pct": 8.47,
        "e_tax": 2.87,
        "ebyCategories": [
          {
            "id": 15200,
            "createdAt": "2024-08-15T13:56:40.849Z",
            "category": "Kameras, Drohnen & Fotozubehör"
          }
        ],
        "catUpdatedAt": "2024-08-19T00:31:50.375Z",
        "cat_prop": "complete",
        "eanUpdatedAt": "2024-08-19T00:31:50.375Z",
        "ean_prop": "found",
        "qEbyUpdatedAt": "2024-09-25T23:37:53.622Z",
        "sku": "4547410357509",
        "cur": "EUR",
        "hasMnfctr": false,
        "e_pRange": {
          "min": 17.95,
          "max": 19.98,
          "median": 18.965
        },
        "e_totalOfferCount": 2,
        "eby_prop": "complete",
        "sdmn": "idealo.de",
        "a_pblsh": true,
        "a_qty": 1,
        "asin": "B071CL735Z",
        "avg30_ahsprcs": 1355,
        "avg30_salesRank": 457671,
        "avg90_ahsprcs": 1355,
        "avg90_salesRank": 417438,
        "brand": "Fujifilm",
        "categories": [
          1358834031
        ],
        "categoryTree": [
          {
            "catId": 562066,
            "name": "Elektronik & Foto"
          },
          {
            "catId": 571860,
            "name": "Kamera & Foto"
          },
          {
            "catId": 331964031,
            "name": "Zubehör"
          },
          {
            "catId": 344744031,
            "name": "Fernglas-Zubehör"
          },
          {
            "catId": 1358834031,
            "name": "Augenmuscheln"
          }
        ],
        "costs": {
          "ktpt": 1.54,
          "azn": 2.03,
          "varc": 0,
          "strg_1_hy": 0.01,
          "strg_2_hy": 0.01,
          "tpt": 1.64,
          "prvsn": 15
        },
        "curr_ahsprcs": 1355,
        "curr_salesRank": 476250,
        "drops90": 1,
        "iwhd": {
          "height": 28,
          "length": 6,
          "width": 42
        },
        "k_eanList": [
          "4547410357509"
        ],
        "keepaEanUpdatedAt": "2024-11-27T14:27:05.671Z",
        "numberOfItems": 1,
        "pwhd": {
          "height": 20,
          "length": 56,
          "width": 50,
          "weight": 20
        },
        "salesRanks": {
          "562066": [
            [
              1724380560,
              221034
            ],
            [
              1726656360,
              413047
            ],
            [
              1727439360,
              429674
            ],
            [
              1729144080,
              453963
            ],
            [
              1731306480,
              457735
            ],
            [
              1732717680,
              476250
            ]
          ],
          "1358958031": [
            [
              1724380560,
              133
            ],
            [
              1726656360,
              246
            ],
            [
              1727439360,
              264
            ],
            [
              1729414200,
              -1
            ],
            [
              1731306480,
              263
            ]
          ]
        },
        "totalOfferCount": 2,
        "a_img": "https://m.media-amazon.com/images/I/41CQBMO0fuL.__AC_SY300_SX300_QL70_ML2_.jpg",
        "a_mrgn": -3.88,
        "a_mrgn_pct": -28.63,
        "a_nm": "Fujifilm Augenmuschel EC-XT M",
        "a_orgn": "a",
        "a_p_mrgn": -4.13,
        "a_p_mrgn_pct": -30.48,
        "a_p_w_mrgn": -4.13,
        "a_p_w_mrgn_pct": -30.48,
        "a_prc": 13.55,
        "a_rating": 4.1,
        "a_reviewcnt": 34,
        "a_uprc": 13.55,
        "a_useCurrPrice": false,
        "a_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0
        },
        "a_w_mrgn": -3.88,
        "a_w_mrgn_pct": -28.63,
        "aznUpdatedAt": "2024-12-25T18:25:55.707Z",
        "bsr": [
          {
            "createdAt": "2024-11-27T14:29:32.954Z",
            "category": "Elektronik & Foto",
            "number": 47625
          }
        ],
        "tax": 19,
        "a": "sofort lieferbar",
        "availUpdatedAt": "2024-12-25T15:54:48.985Z",
        "infoUpdatedAt": "2024-11-27T14:29:33.160Z",
        "info_prop": "complete"
      }

    const { avgField, avgPrice,a_useCurrPrice } = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg30_ahsprcs);
    expect(avgPrice).toBe(product.avg30_ahsprcs / 100);
    expect(a_useCurrPrice).toBe(false);
  });

  test('that avg field is avg90_buyBoxPrice', async () => {
    const product: any = {
        "_id": {
          "$oid": "668e1f2ad63905fe52463180"
        },
        "lnk": "https://www.idealo.de/preisvergleich/OffersOfProduct/2264249_-maurer-set-7604-spielstabil.html",
        "createdAt": "2024-07-10T05:42:02.511Z",
        "ctgry": [
          "Gaming & Spielen",
          "Sandspielzeuge"
        ],
        "e_pblsh": false,
        "e_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0,
          "nm_prop": "complete",
          "score": 0.85,
          "isMatch": true
        },
        "eanList": [
          "4007275076040"
        ],
        "img": "https://cdn.idealo.com/folder/Product/2264/2/2264249/s1_produktbild_gross/spielstabil-maurer-set-7604.jpg",
        "mnfctr": "spielstabil",
        "nm": "Maurer-Set (7604)",
        "prc": 13.9,
        "updatedAt": "2025-01-02T20:15:09.006Z",
        "e_img": "https://i.ebayimg.com/thumbs/images/g/0uYAAOSwfpVnTwB2/s-l500.jpg",
        "e_nm": "Sandspielzeug Maurerset 3-tlg. | spielstabil 7604 | Sandkasten Jungen Spielzeug",
        "e_orgn": "e",
        "e_prc": 13.9,
        "esin": "145626623839",
        "e_mrgn": -1.67,
        "e_mrgn_pct": -12.01,
        "e_ns_mrgn": -1.67,
        "e_ns_mrgn_pct": -12.01,
        "ebyCategories": [
          {
            "id": 220,
            "createdAt": "2024-08-15T13:55:34.463Z",
            "category": "Spielzeug"
          }
        ],
        "e_qty": 1,
        "e_uprc": 13.9,
        "qty": 1,
        "s_hash": "e3d9631d595e8ecca670afce69210554",
        "uprc": 13.9,
        "e_costs": 1.67,
        "e_ns_costs": 1.67,
        "e_tax": 2.22,
        "catUpdatedAt": "2024-08-14T10:42:40.931Z",
        "cat_prop": "complete",
        "eanUpdatedAt": "2024-08-14T10:42:40.931Z",
        "ean_prop": "found",
        "qEbyUpdatedAt": "2024-09-25T10:40:53.224Z",
        "sku": "4007275076040",
        "a": "sofort lieferbar",
        "e_cur": "EUR",
        "nm_v": "v01",
        "nm_updatedAt": "2024-11-29T23:08:02.202Z",
        "availUpdatedAt": "2024-12-26T22:22:56.036Z",
        "dealEbyUpdatedAt": "2024-09-04T12:36:33.424Z",
        "ebyUpdatedAt": "2024-12-26T23:26:23.184Z",
        "e_pRange": {
          "min": 13.9,
          "max": 14.99,
          "median": 14.445
        },
        "e_totalOfferCount": 2,
        "eby_prop": "complete",
        "sdmn": "idealo.de",
        "cur": "EUR",
        "hasMnfctr": false,
        "a_qty": 1,
        "anhstprcs": [
          [
            1722031440,
            1800
          ],
          [
            1729672200,
            -1
          ],
          [
            1730137800,
            2190
          ],
          [
            1732650960,
            -1
          ]
        ],
        "asin": "B0002GTHWY",
        "avg30_salesRank": 235835,
        "avg90_ansprcs": 2037,
        "avg90_buyBoxPrice": 2204,
        "avg90_salesRank": 181443,
        "brand": "Spielstabil",
        "categories": [
          14494861031,
          2077057031
        ],
        "categoryTree": [
          {
            "catId": 12950651,
            "name": "Spielzeug"
          },
          {
            "catId": 360565031,
            "name": "Sport & Outdoor"
          },
          {
            "catId": 14494861031,
            "name": "Sandboxen & Strandspielzeuge"
          }
        ],
        "costs": {
          "prvsn": 15.02,
          "ktpt": 4.38,
          "azn": 4.05,
          "varc": 0,
          "strg_1_hy": 0.13996,
          "strg_2_hy": 0.24114,
          "tpt": 4.37,
          "estmtd": false,
          "dfltTpt": false,
          "noStrgFee": false
        },
        "curr_salesRank": 213381,
        "drops30": 2,
        "drops90": 20,
        "iwhd": {
          "height": 70,
          "length": 330,
          "width": 220
        },
        "k_eanList": [
          "4007275076040"
        ],
        "keepaEanUpdatedAt": "2025-01-02T17:44:34.249Z",
        "pwhd": {
          "height": 70,
          "length": 330,
          "width": 220,
          "weight": 240
        },
        "salesRanks": {
          "12950651": [
            [
              1728043200,
              197922
            ],
            [
              1728238920,
              196555
            ],
            [
              1728372840,
              197932
            ],
            [
              1728504600,
              209299
            ],
            [
              1728676800,
              160819
            ],
            [
              1728862800,
              100634
            ],
            [
              1728986520,
              135837
            ],
            [
              1729156800,
              101560
            ],
            [
              1729672200,
              64814
            ],
            [
              1729973640,
              162143
            ],
            [
              1730192040,
              181181
            ],
            [
              1730426400,
              198039
            ],
            [
              1730656800,
              112158
            ],
            [
              1730780640,
              146215
            ],
            [
              1731025920,
              197349
            ],
            [
              1731240600,
              61350
            ],
            [
              1731436800,
              141279
            ],
            [
              1731660000,
              133437
            ],
            [
              1731850800,
              73988
            ],
            [
              1732045680,
              120144
            ],
            [
              1732264800,
              183754
            ],
            [
              1732490400,
              168144
            ],
            [
              1732650960,
              193605
            ],
            [
              1733182920,
              238106
            ],
            [
              1733513760,
              240473
            ],
            [
              1734473040,
              251065
            ],
            [
              1735421040,
              211193
            ],
            [
              1735839840,
              213381
            ]
          ],
          "2077057031": [
            [
              1728043200,
              261
            ],
            [
              1728303720,
              252
            ],
            [
              1728444120,
              258
            ],
            [
              1728617520,
              183
            ],
            [
              1728802680,
              204
            ],
            [
              1728919800,
              136
            ],
            [
              1729101000,
              89
            ],
            [
              1729222800,
              165
            ],
            [
              1729571640,
              128
            ],
            [
              1729870440,
              168
            ],
            [
              1730175600,
              201
            ],
            [
              1730362560,
              216
            ],
            [
              1730606400,
              70
            ],
            [
              1730750400,
              127
            ],
            [
              1730953200,
              205
            ],
            [
              1731207120,
              35
            ],
            [
              1731375600,
              155
            ],
            [
              1731559200,
              78
            ],
            [
              1731754800,
              154
            ],
            [
              1731917160,
              37
            ],
            [
              1732120920,
              141
            ],
            [
              1732320000,
              76
            ],
            [
              1732550400,
              156
            ],
            [
              1732673640,
              199
            ],
            [
              1733256960,
              218
            ],
            [
              1733621040,
              215
            ],
            [
              1734776280,
              225
            ],
            [
              1735501200,
              191
            ]
          ],
          "14494861031": [
            [
              1728043200,
              1053
            ],
            [
              1728296400,
              1057
            ],
            [
              1728444120,
              1082
            ],
            [
              1728617520,
              658
            ],
            [
              1728732480,
              726
            ],
            [
              1728862800,
              406
            ],
            [
              1728986520,
              577
            ],
            [
              1729156800,
              389
            ],
            [
              1729299480,
              678
            ],
            [
              1729771320,
              481
            ],
            [
              1730082600,
              751
            ],
            [
              1730229120,
              813
            ],
            [
              1730498400,
              881
            ],
            [
              1730706480,
              408
            ],
            [
              1730835000,
              616
            ],
            [
              1731088800,
              832
            ],
            [
              1731279600,
              281
            ],
            [
              1731440400,
              538
            ],
            [
              1731638400,
              429
            ],
            [
              1731815400,
              168
            ],
            [
              1731951600,
              253
            ],
            [
              1732134240,
              504
            ],
            [
              1732415400,
              519
            ],
            [
              1732605120,
              716
            ],
            [
              1732854240,
              839
            ],
            [
              1733350560,
              976
            ],
            [
              1733862480,
              970
            ],
            [
              1734990480,
              947
            ],
            [
              1735684200,
              893
            ]
          ]
        },
        "a_img": "https://m.media-amazon.com/images/I/31PNqreFm7L._SL120_.jpg",
        "a_mrgn": -3.12,
        "a_mrgn_pct": -15.32,
        "a_nm": "Spielstabil 7604 Maurer-Set (sortierte Farbe)",
        "a_p_mrgn": -3.37,
        "a_p_mrgn_pct": -16.54,
        "a_p_w_mrgn": -3.47,
        "a_p_w_mrgn_pct": -17.03,
        "a_pblsh": true,
        "a_prc": 20.37,
        "a_rating": 4.3,
        "a_reviewcnt": 65,
        "a_uprc": 20.37,
        "a_useCurrPrice": true,
        "a_w_mrgn": -3.22,
        "a_w_mrgn_pct": -15.81,
        "aznUpdatedAt": "2025-01-02T17:48:35.658Z",
        "bsr": [
          {
            "category": "Spielzeug",
            "number": 215991,
            "createdAt": "2025-01-02T20:15:09.005Z"
          }
        ],
        "infoUpdatedAt": "2025-01-02T20:15:09.006Z",
        "info_prop": "complete",
        "tax": 19,
        "a_orgn": "a",
        "a_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0
        },
        "totalOfferCount": 0,
        "gl": "gl_toy"
      }

    const { avgField, avgPrice, a_useCurrPrice} = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg90_buyBoxPrice);
    expect(avgPrice).toBe(product.avg90_buyBoxPrice / 100);
    expect(a_useCurrPrice).toBe(false);
  });
  test('that avg field is avg90_anprcs', async () => {
    const product: any ={
        "_id": {
          "$oid": "668b7452d63905fe5217bc1b"
        },
        "lnk": "https://www.idealo.de/preisvergleich/OffersOfProduct/202002880_-era-64gb-pocketbook.html",
        "createdAt": "2024-07-08T05:08:34.546Z",
        "ctgry": [
          "Elektroartikel",
          "E-Book-Reader"
        ],
        "eanList": [
          "4029164130671"
        ],
        "img": "https://cdn.idealo.com/folder/Product/202002/8/202002880/s1_produktbild_mittelgross/pocketbook-era-64gb.jpg",
        "mnfctr": "PocketBook",
        "nm": "Era 64GB",
        "prc": 299.31,
        "updatedAt": "2024-11-18T00:10:53.050Z",
        "qty": 1,
        "s_hash": "2c442c4fbcf2f70eec6285a1722c05cf",
        "uprc": 299.31,
        "eanUpdatedAt": "2024-08-12T18:05:20.488Z",
        "ean_prop": "found",
        "sku": "4029164130671",
        "nm_v": "v01",
        "nm_updatedAt": "2024-10-29T04:33:00.934Z",
        "a": "sofort lieferbar",
        "availUpdatedAt": "2024-10-15T00:09:32.723Z",
        "sdmn": "idealo.de",
        "cur": "EUR",
        "hasMnfctr": false,
        "shop": "idealo.de",
        "e_img": "https://i.ebayimg.com/images/g/o4EAAOSw07xlbJKT/s-l500.webp",
        "e_nm": "Pocketbook Era 64GB Sunset Copper eReader 7\" eINK Touchscreen IPX8 BRANDNEU",
        "e_orgn": "e",
        "e_pRange": {
          "min": 276.99,
          "max": 276.99,
          "median": 276.99
        },
        "e_pblsh": true,
        "e_prc": 0,
        "e_qty": 1,
        "e_totalOfferCount": 1,
        "e_uprc": 0,
        "eby_prop": "complete",
        "esin": "175801255271",
        "qEbyUpdatedAt": "2024-10-20T14:02:21.564Z",
        "ahstprcs": [
          [
            1716049440,
            -1
          ],
          [
            1726146000,
            24900
          ],
          [
            1726299600,
            23999
          ]
        ],
        "anhstprcs": [
          [
            1721389440,
            -1
          ],
          [
            1724969280,
            -1
          ],
          [
            1726299600,
            23999
          ]
        ],
        "asin": "B0B69KLZ7J",
        "auhstprcs": [
          [
            1722390120,
            25440
          ],
          [
            1722621840,
            27086
          ],
          [
            1723767240,
            27748
          ],
          [
            1724854680,
            27858
          ],
          [
            1725983760,
            23720
          ],
          [
            1726499760,
            23709
          ],
          [
            1727211120,
            24998
          ],
          [
            1728208440,
            26016
          ],
          [
            1728843000,
            25535
          ],
          [
            1729233600,
            25815
          ]
        ],
        "avg30_ausprcs": 25476,
        "avg90_ahsprcs": 24831,
        "avg90_ansprcs": 24214,
        "avg90_ausprcs": 25650,
        "brand": "PocketBook",
        "categories": [
          671895031
        ],
        "categoryTree": [
          {
            "catId": 562066,
            "name": "Elektronik & Foto"
          },
          {
            "catId": 671885031,
            "name": "eBook-Reader & -Zubehör"
          },
          {
            "catId": 671895031,
            "name": "eBook-Reader"
          }
        ],
        "k_eanList": [
          "4029164130671"
        ],
        "keepaEanUpdatedAt": "2024-10-29T03:26:44.302Z",
        "numberOfItems": 1,
        "a_img": "https://m.media-amazon.com/images/I/61zFEbAwRiL._SL120_.jpg",
        "a_mrgn": {
          "$numberDouble": "NaN"
        },
        "a_mrgn_pct": {
          "$numberDouble": "NaN"
        },
        "a_nm": "PocketBook e-Book Reader Era (64 GB Speicher, 17.8 cm (7 Zoll) E-Ink Carta 1200 Touchscreen, SMARTlight Hintergrundbeleuchtung, Wi-Fi, Bluetooth) Sunset Copper",
        "a_orgn": "a",
        "a_p_mrgn": {
          "$numberDouble": "NaN"
        },
        "a_p_mrgn_pct": {
          "$numberDouble": "NaN"
        },
        "a_p_w_mrgn": {
          "$numberDouble": "NaN"
        },
        "a_p_w_mrgn_pct": {
          "$numberDouble": "NaN"
        },
        "a_pblsh": true,
        "a_prc": 248.31,
        "a_qty": 1,
        "a_rating": 4,
        "a_reviewcnt": 157,
        "a_uprc": 248.31,
        "a_useCurrPrice": true,
        "a_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0,
          "nm_prop": "complete",
          "score": 0.9,
          "isMatch": true,
          "qty_prop": "complete",
          "qty_score": 0.9
        },
        "a_w_mrgn": {
          "$numberDouble": "NaN"
        },
        "a_w_mrgn_pct": {
          "$numberDouble": "NaN"
        },
        "aznUpdatedAt": "2024-10-29T04:15:32.250Z",
        "bsr": [],
        "costs": {
          "prvsn": 7,
          "ktpt": 2.85
        },
        "infoUpdatedAt": "2024-10-29T04:15:32.250Z",
        "tax": 19,
        "totalOfferCount": 0,
        "catUpdatedAt": "2024-10-27T15:14:36.494Z",
        "cat_prop": "complete",
        "e_costs": 0,
        "e_mrgn": -200.84,
        "e_mrgn_pct": {
          "$numberDouble": "-Infinity"
        },
        "e_ns_costs": 0,
        "e_ns_mrgn": -200.84,
        "e_ns_mrgn_pct": {
          "$numberDouble": "-Infinity"
        },
        "e_tax": 0,
        "e_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0,
          "nm_prop": "complete",
          "score": 0.95,
          "isMatch": true,
          "qty_prop": "complete",
          "qty_score": 0.9
        },
        "ebyCategories": [
          {
            "id": 58058,
            "createdAt": "2024-10-27T15:14:36.494Z",
            "category": "Computer, Tablets & Netzwerk"
          }
        ],
        "ebyUpdatedAt": "2024-10-27T15:14:36.494Z",
        "iwhd": {
          "height": 155,
          "length": 78,
          "width": 134
        },
        "pwhd": {
          "height": 29,
          "length": 179,
          "width": 159
        },
        "info_prop": "no_bsr",
        "keepaUpdatedAt": "2024-10-29T04:21:35.410Z",
        "qty_v": "v04",
        "nm_vrfd": {
          "qty_prop": "complete",
          "qty_score": 0.9
        },
        "qty_updatedAt": "2024-10-29T04:36:00.937Z"
      }

    const { avgField, avgPrice,a_useCurrPrice } = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg90_ansprcs);
    expect(avgPrice).toBe(product.avg90_ansprcs / 100);
    expect(a_useCurrPrice).toBe(false);
  });
  test('that avg field is avg90_ahprcs', async () => {
    const product: any = {
        "_id": {
          "$oid": "66fbfff036f92f05b3bfdc0d"
        },
        "image": "",
        "mnfctr": "FITBIT",
        "hasMnfctr": false,
        "cur": "EUR",
        "nm": "Charge 5, Fitness Tracker, S, L, Steel Blue",
        "prc": 122.99,
        "s_hash": "03e2c442a3ab2ad1a936928ace34e203",
        "lnk": "https://www.saturn.de/de/product/_fitbit-charge-5-fitness-tracker-s-l-steel-blue-2758007.html",
        "ctgry": [
          "Fitness + Gesundheit",
          "Fitness-Tracker mit integriertem GPS (29)"
        ],
        "qty": 1,
        "uprc": 122.99,
        "createdAt": "2024-09-24T02:05:11.394Z",
        "updatedAt": "2024-12-30T22:01:37.380Z",
        "ean": "0810038857220",
        "eanList": [
          "0810038857220"
        ],
        "eanUpdatedAt": "2024-09-24T02:32:40.700Z",
        "ean_prop": "found",
        "img": "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_86694433?x=536&y=402&format=jpg&quality=80&sp=yes&strip=yes&trim&ex=536&ey=402&align=center&resizesource&unsharp=1.5x1+0.7+0.02&cox=0&coy=0&cdx=536&cdy=402",
        "sku": "2758007",
        "e_img": "https://i.ebayimg.com/thumbs/images/g/mkoAAOSwROljYnbY/s-l500.jpg",
        "e_nm": "Fitbit Charge5 Fitnesstracker silber Edelstahl Smartwatch GPS Always-On EKG SpO2",
        "e_orgn": "e",
        "e_pRange": {
          "min": 30,
          "max": 242.99,
          "median": 99.945
        },
        "e_pblsh": true,
        "e_prc": 99.32,
        "e_qty": 1,
        "e_totalOfferCount": 4,
        "e_uprc": 99.32,
        "eby_prop": "complete",
        "esin": "204660993245",
        "qEbyUpdatedAt": "2024-09-26T07:06:28.725Z",
        "catUpdatedAt": "2024-09-26T07:15:29.413Z",
        "cat_prop": "complete",
        "e_costs": 11.92,
        "e_cur": "EUR",
        "e_mrgn": -33.49,
        "e_mrgn_pct": -33.72,
        "e_ns_costs": 11.92,
        "e_ns_mrgn": -33.49,
        "e_ns_mrgn_pct": -33.72,
        "e_tax": 15.86,
        "e_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0,
          "nm_prop": "complete",
          "score": 0.85,
          "isMatch": true,
          "qty_prop": "complete",
          "qty_score": 0.9
        },
        "ebyCategories": [
          {
            "id": 888,
            "createdAt": "2024-09-26T07:15:29.413Z",
            "category": "Sport"
          }
        ],
        "ebyUpdatedAt": "2024-11-03T10:17:00.439Z",
        "dealEbyUpdatedAt": "2024-10-17T21:29:52.071Z",
        "nm_v": "v01",
        "nm_updatedAt": "2024-09-26T07:37:01.266Z",
        "qty_v": "v04",
        "nm_vrfd": {
          "qty_prop": "complete",
          "qty_score": 0.9
        },
        "qty_updatedAt": "2024-09-26T07:41:01.048Z",
        "sdmn": "saturn.de",
        "availUpdatedAt": "2024-12-30T21:51:08.359Z",
        "ahstprcs": [
          [
            1722335280,
            -1
          ],
          [
            1723461840,
            12870
          ]
        ],
        "asin": "B09BXH5MC1",
        "auhstprcs": [
          [
            1722511080,
            9272
          ],
          [
            1723734240,
            7931
          ],
          [
            1725363720,
            8796
          ],
          [
            1729239120,
            8406
          ]
        ],
        "avg30_ausprcs": 8677,
        "avg30_salesRank": 8273,
        "avg90_ahsprcs": 12869,
        "avg90_ausprcs": 8973,
        "avg90_salesRank": 7950,
        "brand": "Fitbit",
        "categories": [
          4203965031,
          675604031,
          3520847031
        ],
        "categoryTree": [
          {
            "catId": 16435051,
            "name": "Sport & Freizeit"
          },
          {
            "catId": 190534011,
            "name": "Sportelektronik"
          },
          {
            "catId": 4203965031,
            "name": "Aktivitätstracker"
          }
        ],
        "costs": {
          "prvsn": 7,
          "ktpt": 3.23,
          "tpt": 3.22,
          "varc": 0,
          "azn": 9.01,
          "strg_1_hy": 0.01934,
          "strg_2_hy": 0.02976,
          "estmtd": false,
          "dfltTpt": false,
          "noStrgFee": false
        },
        "curr_ausprcs": 8406,
        "curr_salesRank": 11596,
        "iwhd": {
          "height": 11,
          "length": 37,
          "width": 23,
          "weight": 29
        },
        "k_eanList": [
          "0810038857220"
        ],
        "keepaEanUpdatedAt": "2024-10-30T22:03:48.808Z",
        "monthlySold": 264,
        "numberOfItems": 1,
        "pwhd": {
          "height": 46,
          "length": 166,
          "width": 92,
          "weight": 150
        },
        "salesRanks": {
          "16435051": [
            [
              1722530640,
              5221
            ],
            [
              1722722160,
              6685
            ],
            [
              1722913200,
              5434
            ],
            [
              1723105320,
              5061
            ],
            [
              1723290720,
              4035
            ],
            [
              1723488240,
              5382
            ],
            [
              1723661520,
              6560
            ],
            [
              1723850880,
              6123
            ],
            [
              1724039640,
              7275
            ],
            [
              1724239800,
              4278
            ],
            [
              1724440320,
              6594
            ],
            [
              1724624640,
              4645
            ],
            [
              1724804880,
              6012
            ],
            [
              1725035760,
              7744
            ],
            [
              1725159120,
              11160
            ],
            [
              1725319440,
              8884
            ],
            [
              1725496920,
              8182
            ],
            [
              1725944160,
              10203
            ],
            [
              1726187040,
              9642
            ],
            [
              1726408800,
              8937
            ],
            [
              1726603440,
              11520
            ],
            [
              1726746480,
              9112
            ],
            [
              1726889160,
              10804
            ],
            [
              1727012880,
              11932
            ],
            [
              1727148480,
              10840
            ],
            [
              1727311440,
              11369
            ],
            [
              1727442240,
              8658
            ],
            [
              1727586480,
              9097
            ],
            [
              1727730000,
              9079
            ],
            [
              1727871720,
              10347
            ],
            [
              1728001440,
              8380
            ],
            [
              1728140400,
              6971
            ],
            [
              1728303840,
              7732
            ],
            [
              1728446880,
              13962
            ],
            [
              1728576720,
              9458
            ],
            [
              1728745080,
              8465
            ],
            [
              1728867840,
              9685
            ],
            [
              1729003440,
              8319
            ],
            [
              1729112160,
              6558
            ],
            [
              1729225200,
              4846
            ],
            [
              1729366560,
              7994
            ],
            [
              1729500480,
              9222
            ],
            [
              1729587360,
              6644
            ],
            [
              1729743600,
              6861
            ],
            [
              1729916640,
              7530
            ],
            [
              1730080800,
              9218
            ],
            [
              1730240760,
              7169
            ]
          ],
          "4203965031": [
            [
              1722530640,
              29
            ],
            [
              1722722160,
              33
            ],
            [
              1722913200,
              28
            ],
            [
              1723179960,
              27
            ],
            [
              1723431600,
              23
            ],
            [
              1723661520,
              29
            ],
            [
              1723874160,
              30
            ],
            [
              1724088480,
              35
            ],
            [
              1724296440,
              31
            ],
            [
              1724550960,
              24
            ],
            [
              1724792880,
              27
            ],
            [
              1725035760,
              41
            ],
            [
              1725234720,
              45
            ],
            [
              1725408480,
              45
            ],
            [
              1725642720,
              39
            ],
            [
              1726072920,
              39
            ],
            [
              1726272000,
              43
            ],
            [
              1726547040,
              53
            ],
            [
              1726695360,
              54
            ],
            [
              1726842480,
              53
            ],
            [
              1726969920,
              53
            ],
            [
              1727103360,
              40
            ],
            [
              1727245560,
              49
            ],
            [
              1727425560,
              41
            ],
            [
              1727572440,
              46
            ],
            [
              1727730000,
              43
            ],
            [
              1727883600,
              50
            ],
            [
              1728012960,
              52
            ],
            [
              1728157680,
              42
            ],
            [
              1728323520,
              40
            ],
            [
              1728484800,
              64
            ],
            [
              1728611520,
              60
            ],
            [
              1728768960,
              59
            ],
            [
              1728905280,
              61
            ],
            [
              1729022880,
              38
            ],
            [
              1729135680,
              41
            ],
            [
              1729311840,
              38
            ],
            [
              1729465680,
              45
            ],
            [
              1729571160,
              38
            ],
            [
              1729720080,
              42
            ],
            [
              1729915800,
              42
            ],
            [
              1730080800,
              46
            ],
            [
              1730240760,
              36
            ]
          ]
        },
        "totalOfferCount": 165,
        "info_prop": "complete",
        "infoUpdatedAt": "2024-12-30T22:11:36.016Z",
        "eby_taskId": "clr22:6638a7ec547aabce6f1708cf",
        "a_img": "https://m.media-amazon.com/images/I/61jcPygZnrL.__AC_SX300_SY300_QL70_ML2_.jpg",
        "a_nm": "Fitbit Charge 5 by Google, Gesundheits- und Fitness Tracker Damen / Herren, bis zu 7 Tage Akkulaufzeit, Tagesform-Index, 20+ Trainningsmodi, EKG-Funktion & Stressmanagement, Fitnessuhr, Android / iOS",
        "a_prc": 128.69,
        "a_qty": 1,
        "a_rating": 3.8,
        "a_reviewcnt": 54823,
        "a_uprc": 128.69,
        "aznUpdatedAt": "2024-12-30T22:11:36.016Z",
        "bsr": [
          {
            "category": "Sport & Freizeit",
            "number": 31935,
            "createdAt": "2024-12-09T20:36:32.760Z"
          }
        ],
        "a_mrgn": -7.46,
        "a_mrgn_pct": -5.8,
        "a_p_mrgn": -7.71,
        "a_p_mrgn_pct": -5.99,
        "a_p_w_mrgn": -7.72,
        "a_p_w_mrgn_pct": -6,
        "a_pblsh": true,
        "a_useCurrPrice": true,
        "a_w_mrgn": -7.47,
        "a_w_mrgn_pct": -5.8
      }

    const { avgField, avgPrice, a_useCurrPrice } = determineAdjustedSellPrice(product, product.a_prc);
    expect(avgField).toBe(AVG_PRICES.avg90_ahsprcs);
    expect(avgPrice).toBe(product.avg90_ahsprcs / 100);
    expect(a_useCurrPrice).toBe(false);
  });

  test('that avg field is null', async () => {
    const product: any = {
        "_id": {
          "$oid": "668b5a63d63905fe52163045"
        },
        "lnk": "https://www.idealo.de/preisvergleich/OffersOfProduct/201494357_-thinkpad-usb-c-universal-dock-40ay0090eu-lenovo.html",
        "createdAt": "2024-07-08T03:17:55.260Z",
        "ctgry": [
          "Elektroartikel",
          "Notebook-Dockingstations"
        ],
        "eanList": [
          "0195348191999"
        ],
        "img": "https://cdn.idealo.com/folder/Product/201494/3/201494357/s1_produktbild_mittelgross/lenovo-thinkpad-usb-c-universal-dock-40ay0090eu.jpg",
        "mnfctr": "Lenovo",
        "nm": "ThinkPad USB-C Universal Dock 40AY0090EU",
        "prc": 142.88,
        "updatedAt": "2024-12-02T00:14:01.419Z",
        "qty": 1,
        "s_hash": "db72b935a32d3d44aca4100900c46fdc",
        "uprc": 142.88,
        "eanUpdatedAt": "2024-08-19T00:25:36.459Z",
        "ean_prop": "found",
        "sku": "0195348191999",
        "cur": "EUR",
        "hasMnfctr": false,
        "sdmn": "idealo.de",
        "nm_v": "v01",
        "qty_v": "v04",
        "nm_vrfd": {
          "qty_prop": "complete",
          "qty_score": 0.95
        },
        "qty_updatedAt": "2024-10-29T04:36:00.937Z",
        "a_qty": 1,
        "asin": "B09BP25QZ1",
        "brand": "Lenovo",
        "categories": [
          430115031
        ],
        "categoryTree": [
          {
            "catId": 340843031,
            "name": "Computer & Zubehör"
          },
          {
            "catId": 427958031,
            "name": "Computer-Zubehör"
          },
          {
            "catId": 430066031,
            "name": "Laptop-Zubehör"
          },
          {
            "catId": 6411155031,
            "name": "Ladegeräte & Dockingstationen"
          },
          {
            "catId": 430115031,
            "name": "Dockingstationen"
          }
        ],
        "costs": {
          "prvsn": 11.82,
          "ktpt": 5.99
        },
        "iwhd": {
          "height": 208,
          "length": 76,
          "width": 157,
          "weight": 327
        },
        "k_eanList": [
          "0195348191999"
        ],
        "keepaEanUpdatedAt": "2024-11-11T15:20:38.366Z",
        "pwhd": {
          "height": 110,
          "length": 450,
          "width": 219,
          "weight": 2649
        },
        "a_img": "https://m.media-amazon.com/images/I/31p6LKd2g0L._SL120_.jpg",
        "a_nm": "WRK Systems INC MC00020220 EXP 4/15/2022",
        "a_orgn": "a",
        "a_pblsh": true,
        "a_prc": 1,
        "a_rating": 4,
        "a_reviewcnt": 19,
        "a_uprc": 1,
        "a_vrfd": {
          "vrfd": false,
          "vrfn_pending": true,
          "flags": [],
          "flag_cnt": 0
        },
        "aznUpdatedAt": "2024-11-11T18:01:59.897Z",
        "bsr": [],
        "infoUpdatedAt": "2024-11-11T18:01:59.897Z",
        "info_prop": "no_bsr",
        "tax": 19,
        "totalOfferCount": 0,
        "eby_prop": "missing",
        "qEbyUpdatedAt": "2024-12-26T15:54:39.697Z"
      }

    const { avgField, avgPrice,a_useCurrPrice} = determineAdjustedSellPrice(product, product.a_prc);
    expect(a_useCurrPrice).toBe(true);
    expect(avgField).toBe(null);
    expect(avgPrice).toBe(0);
  });
});
