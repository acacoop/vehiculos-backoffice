import type { User, UserFilterParams } from "../types/user";
import {
  httpService,
  buildQueryParams,
  type BackendResponse,
  type ServiceResponse,
  type PaginationParams,
} from "../common";
import { ResponseStatus } from "../types/common";

/**
 * Obtiene todos los usuarios (sin paginación)
 */
export async function getAllUsers(
  params?: UserFilterParams & {
    includeInactive?: boolean;
  }
): Promise<ServiceResponse<User[]>> {
  try {
    const queryParams = buildQueryParams(params);
    const response: BackendResponse<User[]> = await httpService.get({
      uri: `/users?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener usuarios",
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
      message: "Error al obtener usuarios",
      error: error as any,
    };
  }
}

/**
 * Obtiene usuarios con paginación
 */
export async function getUsers(
  params?: UserFilterParams & {
    includeInactive?: boolean;
  },
  pagination?: PaginationParams
): Promise<ServiceResponse<User[]>> {
  try {
    const queryParams = buildQueryParams(params, pagination);
    const response: BackendResponse<User[]> = await httpService.get({
      uri: `/users?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener usuarios",
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
      message: "Error al obtener usuarios",
      error: error as any,
    };
  }
}

export async function getUserById(id: string): Promise<ServiceResponse<User>> {
  try {
    const response: BackendResponse<User> = await httpService.get({
      uri: `/users/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as User,
        message: response.message || "Error al obtener usuario",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      data: {} as User,
      message: "Error al obtener usuario",
      error: error as any,
    };
  }
}

export async function updateUserStatus(
  id: string,
  active: boolean
): Promise<ServiceResponse<User>> {
  try {
    const response: BackendResponse<User> = await httpService.patch({
      uri: `/users/${id}`,
      body: { active },
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as User,
        message:
          response.message || "Error al actualizar el estado del usuario",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Estado del usuario actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as User,
      message: "Error al actualizar el estado del usuario",
      error: error as any,
    };
  }
}
