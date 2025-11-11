import type { ServiceResponse } from "../types/common";
import type {
  AssignedMaintenance,
  AssignedMaintenanceInput,
  AssignedMaintenanceFilterParams,
} from "../types/assignedMaintenance";
import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getAssignedMaintenances(
  findOptions?: ApiFindOptions<AssignedMaintenanceFilterParams>,
): Promise<ServiceResponse<AssignedMaintenance[]>> {
  return await apiFindItems<
    AssignedMaintenance,
    AssignedMaintenanceFilterParams
  >({
    uri: "maintenance/assignments",
    findOptions,
    errorMessage: "Error al obtener asignaciones de mantenimiento",
  });
}

export async function getAssignedMaintenanceById(
  id: string,
): Promise<ServiceResponse<AssignedMaintenance>> {
  return await apiFindItemById<AssignedMaintenance>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al obtener asignación de mantenimiento",
  });
}

export async function createAssignedMaintenance(
  payload: AssignedMaintenanceInput,
): Promise<ServiceResponse<AssignedMaintenance>> {
  return await apiCreateItem<AssignedMaintenance>({
    uri: "maintenance/assignments",
    payload,
    errorMessage: "Error al crear asignación de mantenimiento",
  });
}

export async function updateAssignedMaintenance(
  id: string,
  payload: Partial<AssignedMaintenanceInput>,
): Promise<ServiceResponse<AssignedMaintenance>> {
  return await apiUpdateItem<AssignedMaintenance>({
    uri: "maintenance/assignments",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar asignación de mantenimiento",
  });
}

export async function deleteAssignedMaintenance(
  id: string,
): Promise<ServiceResponse<AssignedMaintenance>> {
  return await apiDeleteItem<AssignedMaintenance>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al eliminar asignación de mantenimiento",
  });
}

// Special function for getting assignments for a specific vehicle
export async function getVehicleMaintenances(
  vehicleId: string,
): Promise<ServiceResponse<AssignedMaintenance[]>> {
  return await generalApiCall({
    uri: `vehicles/${vehicleId}/maintenances`,
    method: "GET",
    errorMessage: "Error al obtener mantenimientos del vehículo",
  });
}
