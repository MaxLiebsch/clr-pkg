import pkg from 'mongoose';
const { model, Schema } = pkg;

const PerformanceSchema = new Schema({
   shopId: { type: Schema.Types.ObjectId, ref: 'Shops' },
   crawled: {type: Number},
   found: {type: Number},
   shop: {type: String},
   lastCrawlAt:{type:String},
   foundProducts: {type: Number},
   start: {type: Number},
   rt: {type: String},
   rph: {type: String}
}, {timestamps:true, versionKey: false})

export const Perf = model('Perf', PerformanceSchema);
