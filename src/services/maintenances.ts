import type { ServiceResponse } from "../types/common";
import type {
  Maintenance,
  MaintenanceFilterParams,
  MaintenanceInput,
} from "../types/maintenance";

import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  type ApiFindOptions,
} from "./common";

export async function getMaintenances(
  findOptions?: ApiFindOptions<MaintenanceFilterParams>,
): Promise<ServiceResponse<Maintenance[]>> {
  return await apiFindItems<Maintenance, MaintenanceFilterParams>({
    uri: "maintenance/categories",
    findOptions,
    errorMessage: "Error al obtener mantenimientos",
  });
}

export async function getMaintenanceById(
  id: string,
): Promise<ServiceResponse<Maintenance>> {
  return await apiFindItemById<Maintenance>({
    uri: "maintenance/categories",
    itemId: id,
    errorMessage: "Error al obtener mantenimiento",
  });
}

export async function createMaintenance(
  payload: MaintenanceInput,
): Promise<ServiceResponse<Maintenance>> {
  return await apiCreateItem<Maintenance>({
    uri: "maintenance/categories",
    payload,
    errorMessage: "Error al crear mantenimiento",
  });
}

export async function updateMaintenance(
  id: string,
  payload: MaintenanceInput,
): Promise<ServiceResponse<Maintenance>> {
  return await apiUpdateItem<Maintenance>({
    uri: "maintenance/categories",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar mantenimiento",
  });
}

export async function deleteMaintenance(
  id: string,
): Promise<ServiceResponse<Maintenance>> {
  return await apiDeleteItem<Maintenance>({
    uri: "maintenance/categories",
    itemId: id,
    errorMessage: "Error al eliminar mantenimiento",
  });
}
