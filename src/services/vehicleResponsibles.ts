import type { ServiceResponse } from "../types/common";
import type {
  VehicleResponsible,
  VehicleResponsibleInput,
  VehicleResponsibleFilterParams,
} from "../types/vehicleResponsible";
import {
  apiCreateItem,
  apiDeleteItem,
  apiFindItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

export async function getVehicleResponsibles(
  findOptions?: ApiFindOptions<VehicleResponsibleFilterParams>,
): Promise<ServiceResponse<VehicleResponsible[]>> {
  return await apiFindItems({
    uri: "vehicle-responsibles",
    findOptions,
    paramsConfig: [{ field: "active", transform: (value) => String(value) }],
    errorMessage: "Error al obtener responsables de vehículos",
  });
}

export async function getVehicleResponsibleById(
  id: string,
): Promise<ServiceResponse<VehicleResponsible>> {
  return await apiFindItemById({
    uri: "vehicle-responsibles",
    itemId: id,
    errorMessage: "Error al obtener responsable de vehículo",
  });
}

export async function createVehicleResponsible(
  payload: VehicleResponsibleInput,
): Promise<ServiceResponse<VehicleResponsible>> {
  return await apiCreateItem({
    uri: "vehicle-responsibles",
    payload,
    errorMessage: "Error al crear responsable de vehículo",
  });
}

export async function updateVehicleResponsible(
  id: string,
  payload: Partial<VehicleResponsibleInput>,
): Promise<ServiceResponse<VehicleResponsible>> {
  return await apiUpdateItem({
    uri: "vehicle-responsibles",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar responsable de vehículo",
  });
}

export async function deleteVehicleResponsible(
  id: string,
): Promise<ServiceResponse<VehicleResponsible>> {
  return await apiDeleteItem({
    uri: "vehicle-responsibles",
    itemId: id,
    errorMessage: "Error al eliminar responsable de vehículo",
  });
}
