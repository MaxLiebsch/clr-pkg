

export type QueryKeys = 'brand' | 'model' | 'product.price' | 'product.key' | 'product.value' | 'year' |'subVehicleType' | 'vehicleType'

export interface Query {
    category: QueryCategory
    brand: Brand
    year: Year
    vehicleType?: VehicleType
    subVehicleType?: SubVehicleType
    model: Model
    product: QueryProduct,
    
  }
  export interface Year {
    min: number
    param?:string
    max: number
  }

  export interface VehicleType {
    key: string
    value: string
  }

  export interface SubVehicleType {
    key: string
    value: string
  }
  
  export interface Brand {
    key: string
    value: string
  }
  
  export interface Model {
    key: string
    value: string
  }
  
  export interface QueryProduct {
    key: string;
    value: string
    price?: string
  }
  

  export type QueryCategory = 'default' | 'sold_products' | 'total_listings'
  
  export interface QueryURLSchema {
    baseUrl: string;
    searchParams?: SearchParams;
    suffix?: string;
    category: QueryCategory;
  }

  export interface SearchParams {
    brand?: Brand;
    continent?: string;
    queryPart?: QueryPart;
    year?: Year;
  }

  export interface QueryPart {
    seperator: string;
  }
  