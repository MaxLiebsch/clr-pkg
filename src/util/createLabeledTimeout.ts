import { setTimeout } from "timers";
import crypto from 'crypto';

export function createLabeledTimeout(callback: any, delay: number) {
  const id = crypto.randomBytes(8).toString('hex');
  const timeout = setTimeout(callback, delay);
  return { timeout, id };
}
