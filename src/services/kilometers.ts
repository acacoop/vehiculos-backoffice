import type { ServiceResponse } from "../types/common";
import type {
  VehicleKilometersLog,
  KilometersFilterParams,
  VehicleKilometersLogInput,
} from "../types/kilometer";
import {
  apiFindItems,
  apiCreateItem,
  apiFindItemById,
  apiUpdateItem,
  apiDeleteItem,
  type ApiFindOptions,
} from "./common";

// New standard CRUD endpoints
export async function getVehicleKilometersLogs(
  findOptions?: ApiFindOptions<KilometersFilterParams>,
): Promise<ServiceResponse<VehicleKilometersLog[]>> {
  return await apiFindItems({
    uri: `vehicle-kilometersLogs`,
    findOptions,
    paramsConfig: [
      { field: "vehicleId" },
      { field: "userId" },
      { field: "startDate" },
      { field: "endDate" },
    ],
    errorMessage: "Error al obtener registros de kilometraje",
  });
}

export async function getVehicleKilometersLogById(
  id: string,
): Promise<ServiceResponse<VehicleKilometersLog>> {
  return await apiFindItemById({
    uri: `vehicle-kilometersLogs`,
    itemId: id,
    errorMessage: "Error al obtener registro de kilometraje",
  });
}

export async function createVehicleKilometersLog(
  payload: VehicleKilometersLogInput,
): Promise<ServiceResponse<VehicleKilometersLog>> {
  return await apiCreateItem({
    uri: `vehicle-kilometersLogs`,
    payload,
    errorMessage: "Error al crear registro de kilometraje",
  });
}

export async function updateVehicleKilometersLog(
  id: string,
  payload: Partial<VehicleKilometersLogInput>,
): Promise<ServiceResponse<VehicleKilometersLog>> {
  return await apiUpdateItem({
    uri: `vehicle-kilometersLogs`,
    itemId: id,
    payload,
    errorMessage: "Error al actualizar registro de kilometraje",
  });
}

export async function deleteVehicleKilometersLog(
  id: string,
): Promise<ServiceResponse<void>> {
  return await apiDeleteItem({
    uri: `vehicle-kilometersLogs`,
    itemId: id,
    errorMessage: "Error al eliminar registro de kilometraje",
  });
}
