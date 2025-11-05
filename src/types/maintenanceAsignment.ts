import type { FilterParams } from "./common";
import type { Maintenance } from "./maintenance";
import type { Vehicle } from "./vehicle";

export interface MaintenanceAssignment {
  id: string;
  maintenance: Maintenance;
  vehicle: Vehicle;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface MaintenanceAssignmentInput {
  maintenanceId: string;
  vehicleId: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface MaintenanceAssignmentFilterParams extends FilterParams {
  maintenanceId?: string;
  vehicleId?: string;
}
