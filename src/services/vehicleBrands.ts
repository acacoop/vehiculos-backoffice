import type { ServiceResponse } from "../types/common";
import type {
  VehicleBrand,
  VehicleBrandInput,
  VehicleBrandFilterParams,
} from "../types/vehicleBrand";
import {
  apiCreateItem,
  apiDeleteItem,
  apiFindItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

export async function getVehicleBrands(
  findOptions?: ApiFindOptions<VehicleBrandFilterParams>,
): Promise<ServiceResponse<VehicleBrand[]>> {
  return await apiFindItems({
    uri: "vehicle-brands",
    findOptions,
    errorMessage: "Error al obtener marcas",
  });
}

export async function getVehicleBrandById(
  id: string,
): Promise<ServiceResponse<VehicleBrand>> {
  return await apiFindItemById({
    uri: "vehicle-brands",
    itemId: id,
    errorMessage: "Error al obtener marca",
  });
}

export async function createVehicleBrand(
  payload: VehicleBrandInput,
): Promise<ServiceResponse<VehicleBrand>> {
  return await apiCreateItem({
    uri: "vehicle-brands",
    payload,
    errorMessage: "Error al crear marca",
  });
}

export async function updateVehicleBrand(
  id: string,
  payload: Partial<VehicleBrandInput>,
): Promise<ServiceResponse<VehicleBrand>> {
  return await apiUpdateItem({
    uri: "vehicle-brands",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar marca",
  });
}

export async function deleteVehicleBrand(
  id: string,
): Promise<ServiceResponse<VehicleBrand>> {
  return await apiDeleteItem({
    uri: "vehicle-brands",
    itemId: id,
    errorMessage: "Error al eliminar marca",
  });
}
