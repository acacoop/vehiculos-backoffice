import type { FilterParams } from "./common";
import type { MaintenanceAssignment } from "./maintenanceAsignment";

export interface MaintenanceRecord {
  id: string;
  assignedMaintenance: MaintenanceAssignment;
  date: string;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordInput {
  assignedMaintenanceId: string;
  date: string;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordFilterParams extends FilterParams {
  userId?: string;
  vehicleId?: string;
  maintenanceId?: string;
  assignedMaintenanceId?: string;
}
