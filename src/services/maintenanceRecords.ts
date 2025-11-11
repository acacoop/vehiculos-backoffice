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
  apiUpdateItem,
  apiDeleteItem,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceRecords(
  findOptions?: ApiFindOptions<MaintenanceRecordFilterParams>,
): Promise<ServiceResponse<MaintenanceRecord[]>> {
  return await apiFindItems<MaintenanceRecord, MaintenanceRecordFilterParams>({
    uri: "maintenance/records",
    findOptions,
    errorMessage: "Error al obtener registros de mantenimiento",
  });
}

export async function getMaintenanceRecordById(
  id: string,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiFindItemById<MaintenanceRecord>({
    uri: "maintenance/records",
    itemId: id,
    errorMessage: "Error al obtener registro de mantenimiento",
  });
}

export async function createMaintenanceRecord(
  payload: MaintenanceRecordInput,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiCreateItem<MaintenanceRecord>({
    uri: "maintenance/records",
    payload,
    errorMessage: "Error al crear registro de mantenimiento",
  });
}

export async function updateMaintenanceRecord(
  id: string,
  payload: Partial<MaintenanceRecordInput>,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiUpdateItem<MaintenanceRecord>({
    uri: "maintenance/records",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar registro de mantenimiento",
  });
}

export async function deleteMaintenanceRecord(
  id: string,
): Promise<ServiceResponse<MaintenanceRecord>> {
  return await apiDeleteItem<MaintenanceRecord>({
    uri: "maintenance/records",
    itemId: id,
    errorMessage: "Error al eliminar registro de mantenimiento",
  });
}

export async function getMaintenanceRecordsByVehicle(
  vehicleId: string,
  findOptions?: ApiFindOptions<MaintenanceRecordFilterParams>,
): Promise<ServiceResponse<MaintenanceRecord[]>> {
  return await apiFindItems<MaintenanceRecord, MaintenanceRecordFilterParams>({
    uri: `maintenance/records/vehicle/${vehicleId}`,
    findOptions,
    errorMessage: "Error al obtener registros de mantenimiento por vehículo",
  });
}
