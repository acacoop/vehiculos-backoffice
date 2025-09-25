export interface MaintenanceRecord {
  id?: string; // UUID
  assignedMaintenanceId?: string; // UUID
  vehicleId?: string; // UUID
  maintenanceId?: string; // UUID
  userId: string; // UUID
  date: string | Date;
  kilometers: number;
  notes?: string;
}

export interface MaintenanceRecordCreateDto {
  assignedMaintenanceId?: string;
  vehicleId?: string;
  //maintenanceId?: string;
  userId: string;
  date: Date;
  kilometers: number;
  notes?: string | null;
}

export interface MaintenanceRecordsListResponse {
  items: MaintenanceRecord[];
  total: number;
}

export default {};
