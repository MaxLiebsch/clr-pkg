

export type QueryKeys = 'brand' | 'model' | 'product' | 'year' |'subVehicleType' | 'vehicleType'

export interface Query {
    category: string
    brand: Brand
    year: Year
    vehicleType?: VehicleType
    subVehicleType?: SubVehicleType
    model: Model
    product: Product,
    
  }
  export interface Year {
    min: number
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
  
  export interface Product {
    key: string;
    value: string
  }