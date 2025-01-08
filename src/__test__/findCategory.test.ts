import { EbyCategory } from "../types/ebayCategory";
import { findMappedCategory } from "../util/matching/calculateEbyArbitrage";

describe('findMappedCategory', () => {
  it('should return the correct category when a matching id is found', () => {
    const categories = [444444, 14308];
    const expectedCategory: EbyCategory = {
        category: 'Feinschmecker',
        id: 14308,
        tax: 7,
        tier: {
          no_shop: [
            { up_to: 990, percentage: 0.11 },
            { above: 990, percentage: 0.02 },
          ],
          shop: [
            { above: 990, percentage: 0.02 },
            { up_to: 990, percentage: 0.11 },
          ],
        },
      }
    const result = findMappedCategory(categories);
    expect(result).toEqual(expectedCategory);
  });

  it('should return null when no matching id is found', () => {
    const categories = [3, 4];
    const result = findMappedCategory(categories);
    expect(result).toBeNull();
  });
});
