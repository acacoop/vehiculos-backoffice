import type { FilterParams } from "./common";
import type { Maintenance } from "./maintenance";
import type { VehicleModel } from "./vehicleModel";

export interface MaintenanceRequirement {
  id: string;
  maintenance: Maintenance;
  model: VehicleModel;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
}

export interface MaintenanceRequirementInput {
  maintenanceId: string;
  modelId: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
  startDate: string;
  endDate?: string | null;
}

export interface MaintenanceRequirementFilterParams extends FilterParams {
  maintenanceId?: string;
  modelId?: string;
}
