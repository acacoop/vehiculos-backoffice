import type { Vehicle, VehicleFilterParams } from "../types/vehicle";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

export async function getAllVehicles(
  params?: VehicleFilterParams
): Promise<ServiceResponse<Vehicle[]>> {
  try {
    const allParams = {
      ...params,
      limit: 10000,
    };
    const queryParams = buildQueryParams(allParams);
    const response: BackendResponse<Vehicle[]> = await httpService.get({
      uri: `/vehicles?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener vehículos",
      };
    }

    const mapped = (response.data || []).map(mapVehicleResponse);
    return {
      success: true,
      data: mapped,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener vehículos",
      error: error as any,
    };
  }
}

export async function getVehicles(
  params?: VehicleFilterParams,
  pagination?: PaginationParams
): Promise<ServiceResponse<Vehicle[]>> {
  try {
    const queryParams = buildQueryParams(params, pagination);
    const response: BackendResponse<Vehicle[]> = await httpService.get({
      uri: `/vehicles?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener vehículos",
      };
    }

    const mapped = (response.data || []).map(mapVehicleResponse);
    return {
      success: true,
      data: mapped,
      pagination: response.pagination
        ? {
            page: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
            pages: response.pagination.pages,
          }
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener vehículos",
      error: error as any,
    };
  }
}

export async function getVehicleById(
  id: string
): Promise<ServiceResponse<Vehicle>> {
  try {
    const response: BackendResponse<Vehicle> = await httpService.get({
      uri: `/vehicles/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Vehicle,
        message: response.message || "Error al obtener vehículo",
      };
    }

    return {
      success: true,
      data: mapVehicleResponse(response.data as any),
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Vehicle,
      message: "Error al obtener vehículo",
      error: error as any,
    };
  }
}

export async function updateVehicle(
  id: string,
  vehicleData: Partial<
    Omit<
      Vehicle,
      | "id"
      | "imgUrl"
      | "modelObj"
      | "brand"
      | "model"
      | "brandName"
      | "modelName"
    >
  > & { modelId?: string }
): Promise<ServiceResponse<Vehicle>> {
  try {
    // Build payload for backend (only allowed fields)
    const payload: Record<string, any> = {};
    if (vehicleData.licensePlate !== undefined)
      payload.licensePlate = vehicleData.licensePlate;
    if (vehicleData.year !== undefined) payload.year = vehicleData.year;
    if (vehicleData.chassisNumber !== undefined)
      payload.chassisNumber = vehicleData.chassisNumber;
    if (vehicleData.engineNumber !== undefined)
      payload.engineNumber = vehicleData.engineNumber;
    if (vehicleData.vehicleType !== undefined)
      payload.vehicleType = vehicleData.vehicleType;
    if (vehicleData.transmission !== undefined)
      payload.transmission = vehicleData.transmission;
    if (vehicleData.fuelType !== undefined)
      payload.fuelType = vehicleData.fuelType;
    if (vehicleData.modelId) payload.modelId = vehicleData.modelId;

    const response: BackendResponse<any> = await httpService.patch({
      uri: `/vehicles/${id}`,
      body: payload,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Vehicle,
        message: response.message || "Error al actualizar vehículo",
      };
    }

    return {
      success: true,
      data: mapVehicleResponse(response.data as any),
      message: "Vehículo actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Vehicle,
      message: "Error al actualizar vehículo",
      error: error as any,
    };
  }
}

/**
 * Crea un nuevo vehículo
 */
export async function createVehicle(
  vehicleData: Pick<
    Vehicle,
    | "licensePlate"
    | "year"
    | "chassisNumber"
    | "engineNumber"
    | "vehicleType"
    | "transmission"
    | "fuelType"
    | "modelId"
  >
): Promise<ServiceResponse<Vehicle>> {
  try {
    const payload: Record<string, any> = {
      licensePlate: vehicleData.licensePlate,
      year: vehicleData.year,
      modelId: vehicleData.modelId,
    };
    if (vehicleData.chassisNumber)
      payload.chassisNumber = vehicleData.chassisNumber;
    if (vehicleData.engineNumber)
      payload.engineNumber = vehicleData.engineNumber;
    if (vehicleData.vehicleType) payload.vehicleType = vehicleData.vehicleType;
    if (vehicleData.transmission)
      payload.transmission = vehicleData.transmission;
    if (vehicleData.fuelType) payload.fuelType = vehicleData.fuelType;

    const response: BackendResponse<any> = await httpService.post({
      uri: "/vehicles",
      body: payload,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Vehicle,
        message: response.message || "Error al crear vehículo",
      };
    }

    return {
      success: true,
      data: mapVehicleResponse(response.data as any),
      message: "Vehículo creado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Vehicle,
      message: "Error al crear vehículo",
      error: error as any,
    };
  }
}

/**
 * Obtiene los vehículos que tienen asignado un mantenimiento específico
 */
export async function getVehiclesByMaintenanceId(
  maintenanceId: string,
  pagination?: PaginationParams
): Promise<ServiceResponse<Vehicle[]>> {
  try {
    const paginationParams = buildQueryParams(pagination || {});
    const response: BackendResponse<any[]> = await httpService.get({
      uri: `/maintenance/posibles/${maintenanceId}/vehicles?${paginationParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message:
          response.message || "Error al obtener vehículos del mantenimiento",
      };
    }

    const vehicles: Vehicle[] = response.data.map((item: any) => {
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
    });

    return {
      success: true,
      data: vehicles,
      pagination: response.pagination
        ? {
            page: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
            pages: response.pagination.pages,
          }
        : {
            page: pagination?.page || 1,
            pageSize: pagination?.limit || 20,
            total: vehicles.length,
            pages: Math.ceil(vehicles.length / (pagination?.limit || 20)),
          },
    };
  } catch (error) {
    if ((error as any)?.status === 404) {
      return {
        success: true,
        data: [],
        message: "No hay vehículos asignados a este mantenimiento",
      };
    }

    return {
      success: false,
      data: [],
      message: "Error al obtener vehículos del mantenimiento",
      error: error as any,
    };
  }
}

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
