interface Above {
  above: number;
  percentage: number;
}
interface UpTo {
  up_to: number;
  percentage: number;
}

export interface Tier {
  no_shop: (Above | UpTo)[];
  shop: (Above | UpTo)[];
}
export interface EbyCategory {
  id: number;
  category: string;
  tax?: number;
  tier: Tier;
}
