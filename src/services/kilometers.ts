import type {
  VehicleKilometersLog,
  CreateKilometersLogRequest,
} from "../types/kilometer";
import type { ServiceResponse } from "../common";
import {
  generalApiCall,
  type ApiFindOptions,
  addApiFindOptions,
} from "./common";

export type KilometerFilterParams = {
  startDate?: string;
  endDate?: string;
};

// TODO: Este servicio tiene endpoints específicos por vehículo:
// - GET /vehicles/{vehicleId}/kilometers
// - POST /vehicles/{vehicleId}/kilometers
// La estructura es diferente a los endpoints REST estándar

/**
 * Get kilometers logs for a specific vehicle
 * @param vehicleId - UUID of the vehicle
 * @param findOptions - Optional filters and pagination
 */
export async function getVehicleKilometers(
  vehicleId: string,
  findOptions?: ApiFindOptions<KilometerFilterParams>
): Promise<ServiceResponse<VehicleKilometersLog[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "startDate" },
      { field: "endDate" },
    ]);
  }

  return await generalApiCall<VehicleKilometersLog[]>(
    `vehicles/${vehicleId}/kilometers`,
    "GET",
    "Error al obtener historial de kilometraje",
    undefined,
    params
  );
}

/**
 * Create a new kilometers log for a vehicle
 * @param vehicleId - UUID of the vehicle
 * @param payload - Data for the new kilometers log
 */
export async function createKilometersLog(
  vehicleId: string,
  payload: CreateKilometersLogRequest
): Promise<ServiceResponse<VehicleKilometersLog | null>> {
  return await generalApiCall<VehicleKilometersLog>(
    `vehicles/${vehicleId}/kilometers`,
    "POST",
    "Error al crear registro de kilometraje",
    undefined,
    undefined,
    payload
  );
}
