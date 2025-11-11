import type { FilterParams } from "./common";

export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleBrandInput {
  name: string;
}

export interface VehicleBrandFilterParams extends FilterParams {
  name?: string;
}
