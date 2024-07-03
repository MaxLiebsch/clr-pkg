import crypto from 'crypto';

export const createHash = (str: string) =>
  crypto.createHash('md5').update(str).digest('hex');

export const verifyHash = (str: string, hash: string) =>
  createHash(str) === hash;
