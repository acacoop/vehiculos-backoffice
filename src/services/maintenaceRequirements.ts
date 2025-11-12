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
    uri: "maintenance/assignments",
    findOptions,
    errorMessage: "Error al obtener asignaciones de mantenimiento",
  });
}

export async function getMaintenanceRequirementById(
  id: string,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiFindItemById<MaintenanceRequirement>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al obtener asignación de mantenimiento",
  });
}

export async function createMaintenanceRequirement(
  payload: MaintenanceRequirementInput,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiCreateItem<MaintenanceRequirement>({
    uri: "maintenance/assignments",
    payload,
    errorMessage: "Error al crear asignación de mantenimiento",
  });
}

export async function updateMaintenanceRequirement(
  id: string,
  payload: Partial<MaintenanceRequirementInput>,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiUpdateItem<MaintenanceRequirement>({
    uri: "maintenance/assignments",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar asignación de mantenimiento",
  });
}

export async function deleteMaintenanceRequirement(
  id: string,
): Promise<ServiceResponse<MaintenanceRequirement>> {
  return await apiDeleteItem<MaintenanceRequirement>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al eliminar asignación de mantenimiento",
  });
}
