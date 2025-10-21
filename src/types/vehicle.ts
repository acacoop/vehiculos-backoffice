// NEW nested types for incremental migration
export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleModelType {
  id: string;
  name: string;
  vehicleType?: string;
  brand: VehicleBrand;
}

export interface VehicleBrandListResponse {
  items: VehicleBrand[];
  total: number;
}

export interface VehicleModelListResponse {
  items: VehicleModelType[];
  total: number;
}

export interface Vehicle {
  id: string;
  assignmentId?: string;
  licensePlate: string;
  brand?: string;
  model?: string;
  modelObj?: VehicleModelType | null;
  brandName?: string;
  modelName?: string;
  year: number;
  imgUrl?: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleType?: string;
  transmission?: string;
  fuelType?: string;
  modelId?: string;
}

export interface VehicleFilterParams {
  licensePlate?: string;
  brand?: string;
  model?: string;
  brandId?: string;
  modelId?: string;
  year?: number;
  search?: string;
}

export interface VehiclesApiResponse {
  status: "success" | "error";
  message: string;
  data: Vehicle[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
