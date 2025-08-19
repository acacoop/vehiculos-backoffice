import type { Vehicle, VehicleFilterParams } from "../types/vehicle";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

/**
 * Obtiene todos los vehículos (sin paginación)
 */
export async function getAllVehicles(
  params?: VehicleFilterParams
): Promise<ServiceResponse<Vehicle[]>> {
  try {
    const queryParams = buildQueryParams(params);
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

    return {
      success: true,
      data: response.data,
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

/**
 * Obtiene vehículos con paginación
 */
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

    return {
      success: true,
      data: response.data,
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
      data: response.data,
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
  vehicleData: Partial<Omit<Vehicle, "id" | "imgUrl">>
): Promise<ServiceResponse<Vehicle>> {
  try {
    const response: BackendResponse<Vehicle> = await httpService.patch({
      uri: `/vehicles/${id}`,
      body: vehicleData,
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
      data: response.data,
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
  vehicleData: Omit<Vehicle, "id">
): Promise<ServiceResponse<Vehicle>> {
  try {
    const response: BackendResponse<Vehicle> = await httpService.post({
      uri: "/vehicles",
      body: vehicleData,
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
      data: response.data,
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

    const vehicles: Vehicle[] = response.data.map((item: any) => ({
      id: item.vehicleId,
      assignmentId: item.assignmentId || item.id, // Include assignment ID
      licensePlate: item.licensePlate,
      brand: item.brand,
      model: item.model,
      year: item.year,
      imgUrl: item.imgUrl,
    }));

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
