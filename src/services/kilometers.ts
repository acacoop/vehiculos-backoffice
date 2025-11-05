import type { ServiceResponse } from "../types/common";
import type {
  VehicleKilometersLog,
  KilometersFilterParams,
  VehicleKilometersLogInput,
} from "../types/kilometer";
import { apiFindItems, apiCreateItem, type ApiFindOptions } from "./common";

export async function getVehicleKilometersLogs(
  vehicleId: string,
  findOptions?: ApiFindOptions<KilometersFilterParams>,
): Promise<ServiceResponse<VehicleKilometersLog[]>> {
  return await apiFindItems({
    uri: `vehicles/${vehicleId}/kilometers`,
    findOptions,
    paramsConfig: [{ field: "startDate" }, { field: "endDate" }],
    errorMessage: "Error al obtener historial de kilometraje",
  });
}

export async function createKilometersLog(
  vehicleId: string,
  payload: VehicleKilometersLogInput,
): Promise<ServiceResponse<VehicleKilometersLog>> {
  return await apiCreateItem({
    uri: `vehicles/${vehicleId}/kilometers`,
    payload,
    errorMessage: "Error al crear registro de kilometraje",
  });
}
