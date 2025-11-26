import type { ServiceResponse } from "../types/common";
import type {
  MaintenanceChecklistItem,
  MaintenanceChecklistItemFilterParams,
  MaintenanceChecklistItemInput,
} from "../types/maintenanceChecklistItem";

import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceChecklistItems(
  findOptions?: ApiFindOptions<MaintenanceChecklistItemFilterParams>,
): Promise<ServiceResponse<MaintenanceChecklistItem[]>> {
  return await apiFindItems<
    MaintenanceChecklistItem,
    MaintenanceChecklistItemFilterParams
  >({
    uri: "maintenance/checklist-items",
    findOptions,
    errorMessage: "Error al obtener items de checklist de mantenimiento",
  });
}

export async function getMaintenanceChecklistItemById(
  id: string,
): Promise<ServiceResponse<MaintenanceChecklistItem>> {
  return await apiFindItemById<MaintenanceChecklistItem>({
    uri: "maintenance/checklist-items",
    itemId: id,
    errorMessage: "Error al obtener item de checklist de mantenimiento",
  });
}

export async function updateMaintenanceChecklistItem(
  id: string,
  payload: MaintenanceChecklistItemInput,
): Promise<ServiceResponse<MaintenanceChecklistItem>> {
  return await apiUpdateItem<MaintenanceChecklistItem>({
    uri: "maintenance/checklist-items",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar item de checklist de mantenimiento",
  });
}

export async function deleteMaintenanceChecklistItem(
  id: string,
): Promise<ServiceResponse<MaintenanceChecklistItem>> {
  return await apiDeleteItem<MaintenanceChecklistItem>({
    uri: "maintenance/checklist-items",
    itemId: id,
    errorMessage: "Error al eliminar item de checklist de mantenimiento",
  });
}
