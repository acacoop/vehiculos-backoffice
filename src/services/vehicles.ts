import type { Vehicle, VehicleFilterParams, VehiclesApiResponse } from '../types/vehicle';
import { httpService, transformParamsToKebabCase, type PaginationParams, type ApiResponse } from '../common';

export async function getVehicles(
  params?: VehicleFilterParams, 
  pagination?: PaginationParams
): Promise<VehiclesApiResponse> {
  const queryParams = params ? transformParamsToKebabCase(params) : undefined;
  
  const response: ApiResponse<Vehicle[]> = await httpService.get({
    uri: '/vehicles',
    queryParams,
    pagination,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al obtener vehículos');
  }

  // Retornamos los datos en el formato esperado por VehiclesApiResponse
  return {
    status: 'success',
    message: 'Vehículos obtenidos exitosamente',
    data: response.data,
  } as VehiclesApiResponse;
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response: ApiResponse<Vehicle> = await httpService.get({
    uri: `/vehicles/${id}`,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al obtener vehículo');
  }

  return response.data;
}
