import type { ServiceResponse } from "../types/common";
import type {
  VehicleModel,
  VehicleModelInput,
  VehicleModelFilterParams,
} from "../types/vehicleModel";
import {
  apiCreateItem,
  apiDeleteItem,
  apiFindItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

export async function getVehicleModels(
  findOptions?: ApiFindOptions<VehicleModelFilterParams>,
): Promise<ServiceResponse<VehicleModel[]>> {
  return await apiFindItems({
    uri: "vehicle-models",
    findOptions,
    errorMessage: "Error al obtener modelos",
  });
}

export async function getVehicleModelById(
  id: string,
): Promise<ServiceResponse<VehicleModel>> {
  return await apiFindItemById<VehicleModel>({
    uri: "vehicle-models",
    itemId: id,
    errorMessage: "Error al obtener modelo",
  });
}

export async function createVehicleModel(
  payload: VehicleModelInput,
): Promise<ServiceResponse<VehicleModel>> {
  return await apiCreateItem({
    uri: "vehicle-models",
    payload,
    errorMessage: "Error al crear modelo",
  });
}

export async function updateVehicleModel(
  id: string,
  payload: Partial<VehicleModelInput>,
): Promise<ServiceResponse<VehicleModel>> {
  return await apiUpdateItem({
    uri: "vehicle-models",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar modelo",
  });
}

export async function deleteVehicleModel(
  id: string,
): Promise<ServiceResponse<VehicleModel>> {
  return await apiDeleteItem<VehicleModel>({
    uri: "vehicle-models",
    itemId: id,
    errorMessage: "Error al eliminar modelo",
  });
}
