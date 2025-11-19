import type { FilterParams } from "./common";

export interface MaintenanceChecklistItem {
  id: string;
  maintenanceChecklistId: string;
  passed: boolean;
  observations: string;
}

export interface MaintenanceChecklistItemInput {
  passed: boolean;
  observations: string;
}

export interface MaintenanceChecklistItemFilterParams extends FilterParams {
  maintenanceChecklistId?: string;
  passed?: boolean;
}
