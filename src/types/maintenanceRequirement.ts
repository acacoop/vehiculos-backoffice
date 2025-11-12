import type { FilterParams } from "./common";
import type { Maintenance } from "./maintenance";
import type { Vehicle } from "./vehicle";

export interface MaintenanceRequirement {
  id: string;
  maintenance: Maintenance;
  vehicle: Vehicle;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
}

export interface MaintenanceRequirementInput {
  maintenanceId: string;
  vehicleId: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
  startDate: string;
  endDate?: string | null;
}

export interface MaintenanceRequirementFilterParams extends FilterParams {
  maintenanceId?: string;
  vehicleId?: string;
}
