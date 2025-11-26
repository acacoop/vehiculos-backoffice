import type { FilterParams } from "./common";
import type { BackendChecklistItemStatus } from "../common/constants";

export interface MaintenanceChecklistItem {
  id: string;
  maintenanceChecklistId: string;
  category: string;
  title: string;
  status: BackendChecklistItemStatus;
  observations: string;
}

export interface MaintenanceChecklistItemInput {
  category: string;
  title: string;
  status: BackendChecklistItemStatus;
  observations: string;
}

export interface MaintenanceChecklistItemFilterParams extends FilterParams {
  maintenanceChecklistId?: string;
  status?: BackendChecklistItemStatus;
}
