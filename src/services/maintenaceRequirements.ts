import type { ServiceResponse } from "../types/common";
import type {
  MaintenanceRequirement,
  MaintenanceRequirementFilterParams,
  MaintenanceRequirementInput,
} from "../types/maintenanceRequirement";
import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceRequirements(
  findOptions?: ApiFindOptions<MaintenanceRequirementFilterParams>,
): Promise<ServiceResponse<MaintenanceRequirement[]>> {
  return await apiFindItems<
    MaintenanceRequirement,
    MaintenanceRequirementFilterParams
  >({
    uri: "maintenance/requirements",
    findOptions,
    errorMessage: "Error al obtener requerimientos de mantenimiento",
  });
}

export async function getMaintenanceRequirementById(
  id: string,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiFindItemById<MaintenanceRequirement>({
    uri: "maintenance/requirements",
    itemId: id,
    errorMessage: "Error al obtener requerimiento de mantenimiento",
  });
}

export async function createMaintenanceRequirement(
  payload: MaintenanceRequirementInput,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiCreateItem<MaintenanceRequirement>({
    uri: "maintenance/requirements",
    payload,
    errorMessage: "Error al crear requerimiento de mantenimiento",
  });
}

export async function updateMaintenanceRequirement(
  id: string,
  payload: Partial<MaintenanceRequirementInput>,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiUpdateItem<MaintenanceRequirement>({
    uri: "maintenance/requirements",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar requerimiento de mantenimiento",
  });
}

export async function deleteMaintenanceRequirement(
  id: string,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiDeleteItem<MaintenanceRequirement>({
    uri: "maintenance/requirements",
    itemId: id,
    errorMessage: "Error al eliminar requerimiento de mantenimiento",
  });
}
