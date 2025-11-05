import type { User, UserFilterParams } from "../types/user";
import type { ServiceResponse } from "../common";
import {
  apiFindItems,
  apiFindItemById,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getUsers(
  findOptions?: ApiFindOptions<UserFilterParams>,
): Promise<ServiceResponse<User[]>> {
  return await apiFindItems({
    uri: "users",
    findOptions,
    paramsConfig: [{ field: "active", transform: (value) => String(value) }],
    errorMessage: "Error al obtener usuarios",
  });
}

export async function getUserById(id: string): Promise<ServiceResponse<User>> {
  return await apiFindItemById({
    uri: "users",
    itemId: id,
    errorMessage: "Error al obtener usuario",
  });
}

export async function updateUserStatus(
  id: string,
  active: boolean,
): Promise<ServiceResponse<User>> {
  const endpoint = active ? "activate" : "deactivate";
  return await generalApiCall({
    uri: `users/${id}/${endpoint}`,
    method: "POST",
    errorMessage: `Error al ${active ? "activar" : "desactivar"} usuario`,
  });
}

export async function getMe(): Promise<ServiceResponse<User>> {
  return await generalApiCall({
    uri: "me",
    method: "GET",
    errorMessage: "Error al obtener el usuario actual",
  });
}
