import type { ServiceResponse } from "../types/common";
import type {
  Vehicle,
  VehicleInput,
  VehicleFilterParams,
} from "../types/vehicle";
import {
  apiCreateItem,
  apiFindItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

export async function getVehicles(
  findOptions?: ApiFindOptions<VehicleFilterParams>
): Promise<ServiceResponse<Vehicle[]>> {
  return await apiFindItems({
    uri: "vehicles",
    findOptions,
    errorMessage: "Error al obtener vehículos",
  });
}

export async function getVehicleById(
  id: string
): Promise<ServiceResponse<Vehicle>> {
  return await apiFindItemById({
    uri: "vehicles",
    itemId: id,
    errorMessage: "Error al obtener vehículo",
  });
}

export async function updateVehicle(
  id: string,
  payload: Partial<VehicleInput>
): Promise<ServiceResponse<Vehicle>> {
  return await apiUpdateItem({
    uri: "vehicles",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar vehículo",
  });
}

export async function createVehicle(
  payload: VehicleInput
): Promise<ServiceResponse<Vehicle>> {
  return await apiCreateItem({
    uri: "vehicles",
    payload,
    errorMessage: "Error al crear vehículo",
  });
}
