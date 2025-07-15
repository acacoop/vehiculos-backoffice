import type { Vehicle, VehicleFilterParams } from '../types/vehicle';
import { 
  httpService, 
  buildQueryParams, 
  type PaginationParams, 
  type ServiceResponse, 
  type BackendResponse 
} from '../common';
import { ResponseStatus } from '../types/common';

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
        message: response.message || "Error al obtener vehículos"
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
      error: error as any
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
        message: response.message || "Error al obtener vehículos"
      };
    }

    return {
      success: true,
      data: response.data,
      pagination: response.pagination ? {
        page: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages
      } : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener vehículos",
      error: error as any
    };
  }
}

export async function getVehicleById(id: string): Promise<ServiceResponse<Vehicle>> {
  try {
    const response: BackendResponse<Vehicle> = await httpService.get({
      uri: `/vehicles/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Vehicle,
        message: response.message || "Error al obtener vehículo"
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
      error: error as any
    };
  }
}
