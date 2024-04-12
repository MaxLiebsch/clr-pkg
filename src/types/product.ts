import { Content } from ".";


export interface Product {
   link: string;
   image: string;
   name: string;
   price: string;
   category?: string[];
   description?: string;
   shop?: string;
   nameSub?:string;
   year?: string;
   createdAt: string
   updatedAt: string
   prime: boolean
}

export interface CandidateProduct extends Product {
   candidateNameSplit: string []
}

export interface SrcProductDetails {
      nm: string
      nmSubSplit: string[]
      prc: number
      dscrptnSplit: string[]
      mnfctr: string 
}


export type ProductRecord = Record<Content, string | boolean | Array<string>>


export interface DbProduct {
   s: string
   ean: string
   pblsh: boolean;
   vrfd: boolean
   ctgry: string[]
   mnfctr: string
   nm: string
   img: string
   lnk: string
   prc: number
   createdAt: string
   updatedAt: string
   e_lnk: string
   e_img: string
   e_nm: string
   e_prc: number
   e_mrgn: number
   e_fat: boolean
   e_mrgn_pct: number
   a_lnk: string
   a_img: string
   a_nm: string
   a_prc: number
   a_mrgn: number
   a_fat: boolean
   a_mrgn_pct: number
 }