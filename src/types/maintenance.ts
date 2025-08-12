export interface Maintenance {
  id: string; // UUID format
  name: string;
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
