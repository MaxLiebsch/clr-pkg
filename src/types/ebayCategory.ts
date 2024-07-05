export interface Tier {
  no_shop:
    | { up_to?: number; percentage: number }[]
    | { above?: number; percentage: number }[];
  shop:
    | { up_to?: number; percentage: number }[]
    | { above?: number; percentage: number }[];
}
export interface EbyCategory {
  id: number;
  category: string;
  tier: Tier;
}
