import type { FilterParams } from "../common";
import type { Category } from "./category";

export interface Maintenance {
  id: string;
  category: Category;
  name: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface MaintenanceInput {
  categoryId: string;
  name: string;
  kilometersFrequency?: number;
  daysFrequency?: number;
  observations?: string;
  instructions?: string;
}

export interface MaintenanceFilterParams extends FilterParams {
  name?: string;
  categoryId?: string;
}
