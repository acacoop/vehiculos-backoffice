import type { FilterParams } from "./common";
import type { Maintenance } from "./maintenance";
import type { Vehicle } from "./vehicle";

export interface AssignedMaintenance {
  id: string;
  maintenance: Maintenance;
  vehicle: Vehicle;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface AssignedMaintenanceInput {
  maintenanceId: string;
  vehicleId: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface AssignedMaintenanceFilterParams extends FilterParams {
  maintenanceId?: string;
  vehicleId?: string;
}
