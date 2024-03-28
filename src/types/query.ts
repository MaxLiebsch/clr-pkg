

export type QueryKeys = 'brand' | 'model' | 'product' | 'year'

export interface Query {
    category: string
    brand: Brand
    year: Year
    model: Model
    product: Product
  }
  export interface Year {
    min: number
    max: number
  }
  
  export interface Brand {
    key: string
    value: string
  }
  
  export interface Model {
    key: string
    value: string
  }
  
  export interface Product {
    key: string;
    value: string
  }