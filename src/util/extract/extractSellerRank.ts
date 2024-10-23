import { BSR } from '../../types/product';
import { safeParsePrice } from '../safeParsePrice';

export function extractSellerRank(sellerRank: string, update: any, bsr?: BSR[]) {
  const hasBsr = bsr && bsr.length;
  if (sellerRank) {
    const category = sellerRank.match(/\((.*?)\)/g);
    const number = sellerRank.match(/\d+/g);
    if (category && category.length && number && number.length) {
      update['bsr'] = [
        {
          createdAt: new Date().toISOString(),
          category: category[0].replace(/[\\(\\)]/g, '') || 'Unbekannt',
          number: safeParsePrice(number.join('') || '100000000'),
        },
      ];
    } else {
      !hasBsr && (update['bsr'] = []);
    }
  } else {
    !hasBsr && (update['bsr'] = []);
  }
}
