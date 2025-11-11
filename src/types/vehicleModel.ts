import type { FilterParams } from "./common";
import type { VehicleBrand } from "./vehicleBrand";

export interface VehicleModel {
  id: string;
  name: string;
  brand: VehicleBrand;
  vehicleType?: string;
}

export interface VehicleModelInput {
  name: string;
  brandId: string;
  vehicleType?: string;
}

export interface VehicleModelFilterParams extends FilterParams {
  name?: string;
  brandId?: string;
}
