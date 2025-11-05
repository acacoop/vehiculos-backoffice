import type { ServiceResponse } from "../types/common";
import type {
  MaintenanceAssignment,
  MaintenanceAssignmentInput,
  MaintenanceAssignmentFilterParams,
} from "../types/maintenanceAsignment";
import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getMaintenanceAssignments(
  findOptions?: ApiFindOptions<MaintenanceAssignmentFilterParams>,
): Promise<ServiceResponse<MaintenanceAssignment[]>> {
  return await apiFindItems<
    MaintenanceAssignment,
    MaintenanceAssignmentFilterParams
  >({
    uri: "maintenance/assignments",
    findOptions,
    errorMessage: "Error al obtener asignaciones de mantenimiento",
  });
}

export async function getMaintenanceAssignmentById(
  id: string,
): Promise<ServiceResponse<MaintenanceAssignment>> {
  return await apiFindItemById<MaintenanceAssignment>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al obtener asignación de mantenimiento",
  });
}

export async function createMaintenanceAssignment(
  payload: MaintenanceAssignmentInput,
): Promise<ServiceResponse<MaintenanceAssignment>> {
  return await apiCreateItem<MaintenanceAssignment>({
    uri: "maintenance/assignments",
    payload,
    errorMessage: "Error al crear asignación de mantenimiento",
  });
}

export async function updateMaintenanceAssignment(
  id: string,
  payload: Partial<MaintenanceAssignmentInput>,
): Promise<ServiceResponse<MaintenanceAssignment>> {
  return await apiUpdateItem<MaintenanceAssignment>({
    uri: "maintenance/assignments",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar asignación de mantenimiento",
  });
}

export async function deleteMaintenanceAssignment(
  id: string,
): Promise<ServiceResponse<MaintenanceAssignment>> {
  return await apiDeleteItem<MaintenanceAssignment>({
    uri: "maintenance/assignments",
    itemId: id,
    errorMessage: "Error al eliminar asignación de mantenimiento",
  });
}

// Special function for getting assignments for a specific vehicle
export async function getVehicleMaintenances(
  vehicleId: string,
): Promise<ServiceResponse<MaintenanceAssignment[]>> {
  return await generalApiCall({
    uri: `vehicles/${vehicleId}/maintenances`,
    method: "GET",
    errorMessage: "Error al obtener mantenimientos del vehículo",
  });
}
