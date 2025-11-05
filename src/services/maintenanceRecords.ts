import type { ServiceResponse } from "../types/common";
import type {
  MaintenanceRecord,
  MaintenanceRecordFilterParams,
  MaintenanceRecordInput,
} from "../types/maintenanceRecord";
import {
  apiCreateItem,
  apiFindItemById,
  apiFindItems,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceRecords(
  findOptions?: ApiFindOptions<MaintenanceRecordFilterParams>,
): Promise<ServiceResponse<MaintenanceRecord[]>> {
  return await apiFindItems({
    uri: `maintenance/records`,
    findOptions,
    errorMessage: "Error al obtener todos los registros de mantenimiento",
  });
}

export async function getMaintenanceRecordById(
  id: string,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiFindItemById({
    uri: "maintenance/records",
    itemId: id,
    errorMessage: "Error al obtener registro de mantenimiento por ID",
  });
}

export async function addMaintenanceRecord(
  payload: MaintenanceRecordInput,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiCreateItem({
    uri: "maintenance/records",
    payload,
    errorMessage: "Error al crear registro de mantenimiento",
  });
}
