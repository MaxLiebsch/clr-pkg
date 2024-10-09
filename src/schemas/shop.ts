import pkg from 'mongoose';
import { ShopObject } from '../types/index';
import { UTCDate } from '@date-fns/utc';
import { Shop } from '../types/shop';
const { model, Schema } = pkg;

const Shipping = new Schema({
  gp: { type: Number, default: 0 },
  wr: { type: Number, default: 0 },
  fs: { type: Number, default: 0 },
});

const ShopSchema = new Schema<Shop>(
  {
    manualCategories:{ type: [], default: [] },
    d: { type: String, unique: true, required: true }, //domain
    category: { type: [], default: [] },
    p: [{ type: String, default: '' }], //css selector price
    a: { type: String, default: '' }, //css selector availability
    n: { type: String, default: '' }, //name of the shop
    l: { type: String, default: '' }, //
    ean: { type: String, default: '' }, //css selector ean
    img: { type: [String], default: [] },
    queryUrlSchema: {type: [], default:[]},
    resourceTypes: {
      crawl: { type: [], default: [] },
      product: { type: [], default: [] },
    },
    waitUntil: {
      product: { type: String },
      entryPoint: { type: String },
    },
    entryPoints: { type: [], default: [] },
    queryActions: { type: [], default: [] },
    crawlActions: { type: [], default: [] },
    paginationEl: [{
      type: { type: String },
      sel: { type: String },
      nav: { type: String },
      calculation: {
        method: { type: String },
        last: { type: String },
        sel: { type: String },
      },
    }],
    productList: { type: [], default: [] },
    categories: {
      sel: { type: String },
      type: { type: String },
      subCategories: {
        sel: { type: String },
        type: { type: String },
      },
    },
    imgMeta: {
      baseurl: { type: String },
      imgRegex: { type: String },
      suffix: { type: String },
    },
    actions: {
      type: [],
      default: [],
    },
    f: { type: String, default: '' },
    m: { type: String, default: '' }, // css selector manufactuerer
    ne: { type: String, default: '' }, //
    ps: { type: String, default: '' }, // css selector packag size
    pzn: { type: String, default: '' }, // css selector pzn
    active: { type: Boolean, default: true },
    lastCrawlAt: { type: String, default: new UTCDate().toISOString() },
    lastSelectorTestAt: { type: String, default: new UTCDate().toISOString() },
    purlschema: { type: String, default: '' },
    kws: {
      //keywords to be escaped
      type: [String],
      default: [],
    },
    ap: {
      type: [String],
      default: [],
    },
    ece: {
      type: [String],
      default: [],
    },
    fetch: { type: Boolean },
    s: Shipping,
  },
  { timestamps: true },
);

export const Shops = model('Shops', ShopSchema);
