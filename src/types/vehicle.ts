// NEW nested types for incremental migration
export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleModelType {
  id: string;
  name: string;
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
  id: string; // UUID format
  assignmentId?: string; // For maintenance assignment contexts
  licensePlate: string;
  // Legacy plain fields (to be removed after full migration)
  brand?: string; // derived from modelObj.brand.name
  model?: string; // derived from modelObj.name (will be replaced by modelObj usage)
  // Nested object returned by new backend structure
  modelObj?: VehicleModelType | null;
  // Convenience derived names for UI without breaking old code
  brandName?: string; // = modelObj?.brand.name
  modelName?: string; // = modelObj?.name
  year: number;
  imgUrl?: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleType?: string;
  transmission?: string;
  fuelType?: string;
  // For create/update convenience (frontend only)
  modelId?: string; // selected model id when creating/updating
}

// Parámetros para filtrar vehículos (camelCase para uso interno)
export interface VehicleFilterParams {
  licensePlate?: string; // Se convertirá a license-plate
  brand?: string; // search by brand name (legacy)
  model?: string; // search by model name (legacy)
  brandId?: string; // new filter id-based
  modelId?: string; // new filter id-based
  year?: number;
}

// Respuesta específica para vehículos
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
