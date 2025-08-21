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
    // Agregamos un límite muy alto para obtener todos los usuarios
    const allParams = {
      ...params,
      limit: 10000, // Límite alto para obtener todos los registros
    };
    const queryParams = buildQueryParams(allParams);
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
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: "Error al obtener usuarios",
      error: error as never,
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
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: "Error al obtener usuarios",
      error: error as never,
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
  } catch (error: unknown) {
    return {
      success: false,
      data: {} as User,
      message: "Error al obtener usuario",
      error: error as never,
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
  } catch (error: unknown) {
    return {
      success: false,
      data: {} as User,
      message: "Error al actualizar el estado del usuario",
      error: error as never,
    };
  }
}

/**
 * Obtiene el usuario actual (/me)
 */
export async function getMe(): Promise<ServiceResponse<User>> {
  try {
    const response: BackendResponse<User> = await httpService.get({
      uri: "/me",
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as User,
        message: response.message || "Error al obtener el usuario actual",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: {} as User,
      message: "Error al obtener el usuario actual",
      error: error as never,
    };
  }
}
