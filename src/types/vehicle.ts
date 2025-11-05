import type { FilterParams } from "./common";
import type { VehicleModel } from "./vehicleModel";

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: VehicleModel;
  year: number;
  chassisNumber?: string;
  engineNumber?: string;
  transmission?: string;
  fuelType?: string;
}

export interface VehicleInput {
  licensePlate: string;
  modelId: string;
  year: number;
  chassisNumber?: string;
  engineNumber?: string;
  transmission?: string;
  fuelType?: string;
}

export interface VehicleFilterParams extends FilterParams {
  licensePlate?: string;
  brand?: string;
  model?: string;
  brandId?: string;
  modelId?: string;
  year?: number;
}
