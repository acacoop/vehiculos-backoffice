import type { ServiceResponse } from "../common";
import type {
  VehicleBrand,
  VehicleBrandListResponse,
  VehicleBrandFilterParams,
} from "../types/vehicle";
import {
  addApiFindOptions,
  apiCreateItem,
  apiDeleteItem,
  apiFindAllItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

export async function getVehicleBrands(
  findOptions?: ApiFindOptions<VehicleBrandFilterParams>
): Promise<ServiceResponse<VehicleBrandListResponse>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [{ field: "name" }]);
  }

  const response = await apiFindAllItems<VehicleBrand>(
    "vehicle-brands",
    params,
    undefined,
    "Error al obtener marcas"
  );

  const items = response.data || [];
  const total = response.pagination?.total || items.length;

  return {
    ...response,
    data: { items, total },
  };
}

export async function getVehicleBrandById(
  id: string
): Promise<ServiceResponse<VehicleBrand | null>> {
  return await apiFindItemById<VehicleBrand>(
    "vehicle-brands",
    id,
    undefined,
    "Error al obtener marca"
  );
}

export async function createVehicleBrand(payload: {
  name: string;
}): Promise<ServiceResponse<VehicleBrand | null>> {
  return await apiCreateItem<VehicleBrand>(
    "vehicle-brands",
    payload,
    undefined,
    "Error al crear marca"
  );
}

export async function updateVehicleBrand(
  id: string,
  payload: { name: string }
): Promise<ServiceResponse<VehicleBrand | null>> {
  return await apiUpdateItem<VehicleBrand>(
    "vehicle-brands",
    id,
    payload,
    undefined,
    "Error al actualizar marca"
  );
}

export async function deleteVehicleBrand(
  id: string
): Promise<ServiceResponse<boolean>> {
  const response = await apiDeleteItem<null>(
    "vehicle-brands",
    id,
    undefined,
    "Error al eliminar marca"
  );

  return {
    ...response,
    data: response.success,
  };
}
