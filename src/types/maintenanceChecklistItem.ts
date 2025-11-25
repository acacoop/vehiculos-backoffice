import type { CHECKLIST_ITEM_STATUS } from "../common";
import type { FilterParams } from "./common";

export interface MaintenanceChecklistItem {
  id: string;
  maintenanceChecklistId: string;
  title: string;
  status: keyof typeof CHECKLIST_ITEM_STATUS;
  observations: string;
}

export interface MaintenanceChecklistItemInput {
  title: string;
  status: keyof typeof CHECKLIST_ITEM_STATUS;
  observations: string;
}

export interface MaintenanceChecklistItemFilterParams extends FilterParams {
  maintenanceChecklistId?: string;
  status?: keyof typeof CHECKLIST_ITEM_STATUS;
}
