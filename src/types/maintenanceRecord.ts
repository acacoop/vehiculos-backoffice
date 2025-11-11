import type { FilterParams } from "./common";
import type { AssignedMaintenance } from "./assignedMaintenance";
import type { User } from "./user";

export interface MaintenanceRecord {
  id: string;
  assignedMaintenance: AssignedMaintenance;
  user: User;
  date: string;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordInput {
  assignedMaintenanceId: string;
  userId: string;
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
