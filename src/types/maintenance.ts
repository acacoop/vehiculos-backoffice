export interface Maintenance {
  id: string;
  categoryId: string;
  name: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface MaintenanceFilterParams {
  name?: string;
  categoryId?: string;
  search?: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  frequencyKm: number;
  frequencyDays: number;
  observations?: string;
  instructions?: string;
}

export type MaintenancePossible = MaintenanceItem;

export interface MaintenanceAssignment {
  id: string;
  vehicleId: string;
  maintenanceId: string;
  kilometersFrequency: number | null;
  daysFrequency: number;
  maintenance_name: string;
  maintenance_category_name: string;
}

export interface MaintenanceVehicleAssignment {
  id: string; // assignment id
  vehicleId: string;
  maintenanceId: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  // Vehicle details
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  imgUrl?: string;
}
