import type { ServiceResponse } from "../types/common";
import type {
  MaintenanceChecklist,
  MaintenanceChecklistFilterParams,
  MaintenanceChecklistInput,
  MaintenanceChecklistFillPayload,
} from "../types/maintenanceChecklist";

import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceChecklists(
  findOptions?: ApiFindOptions<MaintenanceChecklistFilterParams>,
): Promise<ServiceResponse<MaintenanceChecklist[]>> {
  return await apiFindItems<
    MaintenanceChecklist,
    MaintenanceChecklistFilterParams
  >({
    uri: "maintenance/checklists",
    findOptions,
    errorMessage: "Error al obtener checklists de mantenimiento",
  });
}

export async function getMaintenanceChecklistById(
  id: string,
): Promise<ServiceResponse<MaintenanceChecklist>> {
  return await apiFindItemById<MaintenanceChecklist>({
    uri: "maintenance/checklists",
    itemId: id,
    errorMessage: "Error al obtener checklist de mantenimiento",
  });
}

export async function createMaintenanceChecklist(
  payload: MaintenanceChecklistInput,
): Promise<ServiceResponse<MaintenanceChecklist>> {
  return await apiCreateItem<MaintenanceChecklist>({
    uri: "maintenance/checklists",
    payload,
    errorMessage: "Error al crear checklist de mantenimiento",
  });
}

export async function updateMaintenanceChecklist(
  id: string,
  payload: MaintenanceChecklistInput,
): Promise<ServiceResponse<MaintenanceChecklist>> {
  return await apiUpdateItem<MaintenanceChecklist>({
    uri: "maintenance/checklists",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar checklist de mantenimiento",
  });
}

export async function deleteMaintenanceChecklist(
  id: string,
): Promise<ServiceResponse<MaintenanceChecklist>> {
  return await apiDeleteItem<MaintenanceChecklist>({
    uri: "maintenance/checklists",
    itemId: id,
    errorMessage: "Error al eliminar checklist de mantenimiento",
  });
}

export async function fillMaintenanceChecklist(
  id: string,
  payload: MaintenanceChecklistFillPayload,
): Promise<ServiceResponse<MaintenanceChecklist>> {
  return generalApiCall<MaintenanceChecklist>({
    uri: `maintenance/checklists/${id}/fill`,
    method: "POST",
    errorMessage: "Error al completar checklist de mantenimiento",
    body: payload,
  });
}
