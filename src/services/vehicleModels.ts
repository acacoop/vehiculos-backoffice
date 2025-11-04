import type { ServiceResponse } from "../common";
import type {
  VehicleModelType,
  VehicleModelListResponse,
  VehicleModelFilterParams,
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

const normalizeVehicleModel = (item: any): VehicleModelType => ({
  id: item.id,
  name: item.name,
  vehicleType: item.vehicleType || item.vehicle_type,
  brand: item.brand,
});

export async function getVehicleModels(
  findOptions?: ApiFindOptions<VehicleModelFilterParams>
): Promise<ServiceResponse<VehicleModelListResponse>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "name" },
      { field: "brandId" },
    ]);
  }

  const response = await apiFindAllItems<VehicleModelType>(
    "vehicle-models",
    params,
    normalizeVehicleModel,
    "Error al obtener modelos"
  );

  const items = response.data || [];
  const total = response.pagination?.total || items.length;

  return {
    ...response,
    data: { items, total },
  };
}

export async function getVehicleModelById(
  id: string
): Promise<ServiceResponse<VehicleModelType | null>> {
  return await apiFindItemById<VehicleModelType>(
    "vehicle-models",
    id,
    normalizeVehicleModel,
    "Error al obtener modelo"
  );
}

export async function createVehicleModel(payload: {
  name: string;
  brandId: string;
  vehicleType?: string;
}): Promise<ServiceResponse<VehicleModelType | null>> {
  return await apiCreateItem<VehicleModelType>(
    "vehicle-models",
    payload,
    normalizeVehicleModel,
    "Error al crear modelo"
  );
}

export async function updateVehicleModel(
  id: string,
  payload: {
    name: string;
    brandId?: string;
    vehicleType?: string;
  }
): Promise<ServiceResponse<VehicleModelType | null>> {
  return await apiUpdateItem<VehicleModelType>(
    "vehicle-models",
    id,
    payload,
    normalizeVehicleModel,
    "Error al actualizar modelo"
  );
}

export async function deleteVehicleModel(
  id: string
): Promise<ServiceResponse<boolean>> {
  const response = await apiDeleteItem<null>(
    "vehicle-models",
    id,
    undefined,
    "Error al eliminar modelo"
  );

  return {
    ...response,
    data: response.success,
  };
}
