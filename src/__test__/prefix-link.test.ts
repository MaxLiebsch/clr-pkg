import { prefixLink } from '../util/matching/compare_helper';
import { describe, expect, test } from '@jest/globals';

describe('prefixLink.ts', () => {
  test('prefixlink', () => {
    expect(
      prefixLink('/Images/300x251/2884145_31ea132340a3.png', 'proshop.de'),
    ).toBe('https://www.proshop.de/Images/300x251/2884145_31ea132340a3.png');
  });
});
