import { describe, expect, test } from '@jest/globals';
import {
  rotateScreenResolution,
  rotateUserAgent,
} from '../util/browser/getPage';

describe('rotate Browser mask', () => {
  test('rotateUserAgent', () => {
    const result = rotateUserAgent(0, 'idealo.de');
    console.log('result:', result);
    const result1 = rotateUserAgent(1, 'idealo.de');
    console.log('result:', result1);
    const result2 = rotateUserAgent(10, 'idealo.de');
    expect(result2).toBe(result1);
    console.log('result:', result2);
    const result3 = rotateUserAgent(12, 'idealo.de');
    console.log('result:', result3);
    const result4 = rotateUserAgent(21, 'idealo.de');
    expect(result4).toBe(result3);
  });
  test('rotage Screen Resolution', () => {
    const a = rotateScreenResolution('Windows', 0, 'dealo.de');
    console.log('resutl:', a);
    const b = rotateScreenResolution('Windows', 11, 'idealo.de');
    console.log('resutl:', b);
    const c = rotateScreenResolution('Windows', 12, 'idealo.de');
    expect(c).toBe(b);
    console.log('resutl:', c);
    const d = rotateScreenResolution('Windows', 33, 'idealo.de');
    console.log('resutl:', d);
    const e = rotateScreenResolution('Windows', 34, 'idealo.de');
    expect(e).toBe(d);
    console.log('resutl:', e);
  });
});
