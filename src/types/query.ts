

export type QueryKeys = 'brand' | 'model' | 'product' | 'year' |'subVehicleType' | 'vehicleType'

export interface Query {
    category: string
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
  }


  export interface QueryURLSchema {
    baseUrl: string;
    searchParams?: SearchParams;
    suffix?: string;
    category: string;
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
  