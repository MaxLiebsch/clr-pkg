
export type Content =
  | 'link'
  | 'price'
  | 'mnfctr'
  | 'cur'
  | 'hasMnfctr'
  | 'promoPrice'
  | 'van'
  | 'asin'
  | 'sku'
  | 'mku'
  | 'ean'
  | 'vendor'
  | 'vendorLink'
  | 'name'
  | 'shop'
  | 'category'
  | 'description'
  | 'nameSub'
  | 'redirect_link'
  | 'image'
  | 'prime'
  | 'year';

export interface Product {
  createdAt?: string;
  updatedAt?: string;
  matchedAt?: string;
  link: string;
  image: string;
  name: string;
  vendor?: string;
  vendorLink?: string;
  promoPrice?: string;
  price: number;
  category?: string[];
  description?: string;
  shop?: string;
  nameSub?: string;
  year?: string;
  prime: boolean;
}

export interface CandidateProduct extends Product {
  nameSegments: string[];
}

export interface SrcProductDetails {
  nm: string;
  nmSubSegments: string[];
  prc: number;
  dscrptnSegments: string[];
  mnfctr: string;
}

export type ProductRecord = Partial<Record<Content, string | boolean | Array<string> | number>>;

export interface DbProduct {
  s: string;
  ean: string;
  asin: string;
  curr: string;
  bsr: [
    {
      number: number;
      createdAt: string;
      category: string;
    },
  ];
  anr: string; //article number
  pblsh: boolean;
  ctgry: string[];
  mnfctr: string;
  nm: string;
  img: string;
  lnk: string;
  qty: number;
  prc: number;
  createdAt: string;
  updatedAt: string;
  e_lnk: string;
  e_orgn: string;
  e_img: string;
  e_nm: string;
  e_prc: number;
  e_mrgn: number;
  e_mrgn_pct: number;
  a_orgn: string;
  a_lnk: string; 
  a_img: string;
  a_nm: string;
  a_prc: number;
  a_mrgn: number;
  a_mrgn_pct: number;
}
