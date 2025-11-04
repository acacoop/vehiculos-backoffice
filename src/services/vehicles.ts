import type { Vehicle, VehicleFilterParams } from "../types/vehicle";
import type { ServiceResponse } from "../common";
import {
  addApiFindOptions,
  apiCreateItem,
  apiFindAllItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

// Helper to normalize backend vehicle (new or legacy) into incremental Vehicle shape
function mapVehicleResponse(raw: any): Vehicle {
  if (!raw) return {} as Vehicle;
  const modelObj = raw.model && raw.model.brand ? raw.model : raw.modelObj;
  const brandName = modelObj?.brand?.name;
  const modelName = modelObj?.name;
  return {
    id: raw.id,
    licensePlate: raw.licensePlate,
    year: raw.year,
    chassisNumber: raw.chassisNumber ?? undefined,
    engineNumber: raw.engineNumber ?? undefined,
    vehicleType: raw.vehicleType ?? undefined,
    transmission: raw.transmission ?? undefined,
    fuelType: raw.fuelType ?? undefined,
    // legacy fallback
    brand: raw.brand || brandName,
    model: raw.model || modelName,
    modelObj: modelObj || null,
    brandName,
    modelName,
  } as Vehicle;
}

export async function getVehicles(
  findOptions?: ApiFindOptions<VehicleFilterParams>
): Promise<ServiceResponse<Vehicle[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "brandId" },
      { field: "modelId" },
      { field: "vehicleType" },
      { field: "year" },
      { field: "licensePlate" },
    ]);
  }

  return await apiFindAllItems<Vehicle>(
    "vehicles",
    params,
    mapVehicleResponse,
    "Error al obtener vehículos"
  );
}

export async function getVehicleById(
  id: string
): Promise<ServiceResponse<Vehicle | null>> {
  return await apiFindItemById<Vehicle>(
    "vehicles",
    id,
    mapVehicleResponse,
    "Error al obtener vehículo"
  );
}

export async function updateVehicle(
  id: string,
  payload: Partial<
    Pick<
      Vehicle,
      | "licensePlate"
      | "year"
      | "chassisNumber"
      | "engineNumber"
      | "vehicleType"
      | "transmission"
      | "fuelType"
    >
  > & { modelId?: string }
): Promise<ServiceResponse<Vehicle | null>> {
  return await apiUpdateItem<Vehicle>(
    "vehicles",
    id,
    payload,
    mapVehicleResponse,
    "Error al actualizar vehículo"
  );
}

export async function createVehicle(payload: {
  licensePlate: string;
  year: number;
  modelId: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleType?: string;
  transmission?: string;
  fuelType?: string;
}): Promise<ServiceResponse<Vehicle | null>> {
  return await apiCreateItem<Vehicle>(
    "vehicles",
    payload,
    mapVehicleResponse,
    "Error al crear vehículo"
  );
}

/**
 * Obtiene los vehículos que tienen asignado un mantenimiento específico
 * TODO: Endpoint especial con estructura diferente - mantener implementación original
 */
export async function getVehiclesByMaintenanceId(
  maintenanceId: string,
  pagination?: {
    page: number;
    limit: number;
  }
): Promise<ServiceResponse<Vehicle[]>> {
  // TODO: Este endpoint tiene una estructura especial con /maintenance/posibles
  // y retorna datos en formato diferente. Mantener implementación custom por ahora.
  const findOptions: ApiFindOptions<{}> = {
    pagination,
  };

  const usp = new URLSearchParams();
  addApiFindOptions(usp, findOptions, []);

  const response = await apiFindAllItems<Vehicle>(
    `maintenance/posibles/${maintenanceId}/vehicles`,
    usp,
    (item: any) => {
      // Support both legacy flat and new nested shapes in this endpoint
      if (item.model && item.model.brand) {
        return mapVehicleResponse({
          id: item.vehicleId || item.id,
          licensePlate: item.licensePlate,
          year: item.year,
          chassisNumber: item.chassisNumber,
          engineNumber: item.engineNumber,
          vehicleType: item.vehicleType,
          transmission: item.transmission,
          fuelType: item.fuelType,
          model: item.model,
        });
      }
      return {
        id: item.vehicleId,
        assignmentId: item.assignmentId || item.id,
        licensePlate: item.licensePlate,
        brand: item.brand,
        model: item.model,
        year: item.year,
        imgUrl: item.imgUrl,
        chassisNumber: item.chassisNumber,
        engineNumber: item.engineNumber,
        vehicleType: item.vehicleType,
        transmission: item.transmission,
        fuelType: item.fuelType,
      } as Vehicle;
    },
    "Error al obtener vehículos del mantenimiento"
  );

  return {
    ...response,
    data: response.data || [],
  };
}
