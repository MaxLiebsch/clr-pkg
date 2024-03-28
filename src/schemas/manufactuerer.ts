import pkg from 'mongoose';
import { manufactuererObj } from '../types/index';
const { model, Schema } = pkg;

const manufactuererschema = new Schema<manufactuererObj>(
  {
    n: { type: String, unique: true },
  },
  { timestamps: false, versionKey: false }
);

export const Manufactuerer = model('manufactuerer', manufactuererschema);
