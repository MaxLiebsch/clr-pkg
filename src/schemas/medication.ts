import pkg, { Model } from 'mongoose';
import { IMedication, RichLink } from '../types';
const { model, Schema } = pkg;

//a availability p price l link n name

const richLink = new Schema<RichLink, Model<RichLink>, RichLink>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shops' },
    c: {
      l: { type: String, default: '' },
      p: { type: String, default: '' },
      a: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false, _id: false }
);

const RatingSchema = new Schema({
  sessionId: { type: String, required: true },
  rating: {
    type: Number,
    required: true,
    default: 0,
    _id: false,
    versionKey: false,
  },
});

const Manufactuerer = new Schema({
  maker_id: { type: Schema.Types.ObjectId, ref: 'Manufactuerer' },
  n: { type: String, default: '' },
});

const RelatedProducts = new Schema({
  medication_id: { type: Schema.Types.ObjectId, ref: 'Medication' },
  ps: { type: String, default: '' },
  n: {type:String, default: ''},
  pzn: { type: String, default: '' },
});

const Medication = new Schema<IMedication, Model<IMedication>, IMedication>(
  {
    pzn: { type: String, required: true },
    n: { type: String, default: '' },
    ls: [richLink],
    slug: { type: String, default: '' },
    html: { type: String, default: '' },
    mmi: {type: Boolean, default: false},
    docs: {type:Boolean, default: false},
    createdAt: {type: String, default: ''},
    m: Manufactuerer,
    ps: { type: String, default: '' },
    size: { type: Number, default: 0.0 },
    size_uc: { type: String, default: '' },
    otc: { type: Boolean, default: true },
    ean: { type: String, default: '' },
    published: { type: Boolean, default: false },
    ops: {
      type: [RelatedProducts],
      default: [],
    },
    uvp: { type: Number, default: 0 },
    ekp: { type: Number, default: 0 },
    rating: { type: [RatingSchema], default: [] },
    ratingAvg: { type: Number, default: 0 },
    ingr: {
      type: [String],
      default: [],
    },
    syms: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

export const Med = model('Medication', Medication);
