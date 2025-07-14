import type { User, UserFilterParams } from "../types/user";
import { httpService, type ApiResponse } from "../common";

export async function getUsers(
  params?: UserFilterParams & {
    includeInactive?: boolean;
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse<User[]>> {
  const queryParams = new URLSearchParams();

  if (params?.includeInactive) {
    queryParams.append("includeInactive", "true");
  }

  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }

  const response: ApiResponse<User[]> = await httpService.get({
    uri: `/users?${queryParams.toString()}`,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || "Error al obtener usuarios");
  }

  return response;
}

export async function getUserById(id: string): Promise<User> {
  const response: ApiResponse<User> = await httpService.get({
    uri: `/users/${id}`,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || "Error al obtener usuario");
  }

  return response.data;
}

export async function updateUserStatus(
  id: string,
  active: boolean
): Promise<User> {
  const response: ApiResponse<User> = await httpService.patch({
    uri: `/users/${id}`,
    body: { active },
  });

  if (!response.success) {
    throw new Error(
      response.error?.detail || "Error al actualizar el estado del usuario"
    );
  }

  return response.data;
}
