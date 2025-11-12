import type { FilterParams } from "./common";
import type { User } from "./user";
import type { Vehicle } from "./vehicle";
import type { Maintenance } from "./maintenance";

export interface MaintenanceRecord {
  id: string;
  maintenance: Maintenance;
  vehicle: Vehicle;
  user: User;
  date: string;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordInput {
  maintenanceId: string;
  vehicleId: string;
  userId: string;
  date: string;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordFilterParams extends FilterParams {
  userId?: string;
  vehicleId?: string;
  maintenanceId?: string;
}
