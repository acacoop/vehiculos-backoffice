import type { User, UserFilterParams, UsersApiResponse } from '../types/user';
import { httpService, transformParamsToKebabCase, type PaginationParams, type ApiResponse } from '../common';

export async function getUsers(
  params?: UserFilterParams, 
  pagination?: PaginationParams
): Promise<UsersApiResponse> {
  const queryParams = params ? transformParamsToKebabCase(params) : undefined;
  
  const response: ApiResponse<User[]> = await httpService.get({
    uri: '/users',
    queryParams,
    pagination,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al obtener usuarios');
  }

  // Retornamos los datos en el formato esperado por UsersApiResponse
  return {
    status: 'success',
    message: 'Usuarios obtenidos exitosamente',
    data: response.data,
  } as UsersApiResponse;
}

export async function getUserById(id: string): Promise<User> {
  const response: ApiResponse<User> = await httpService.get({
    uri: `/users/${id}`,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al obtener usuario');
  }

  return response.data;
}

