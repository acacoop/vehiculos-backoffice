import type { User, UserFilterParams } from "../types/user";
import type { ServiceResponse } from "../common";
import {
  addApiFindOptions,
  apiFindAllItems,
  apiFindItemById,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getUsers(
  findOptions?: ApiFindOptions<UserFilterParams>
): Promise<ServiceResponse<User[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "email" },
      { field: "cuit" },
      { field: "firstName" },
      { field: "lastName" },
      { field: "active", transform: (value) => String(value) },
    ]);
  }

  return await apiFindAllItems<User>(
    "users",
    params,
    undefined,
    "Error al obtener usuarios"
  );
}

export async function getUserById(
  id: string
): Promise<ServiceResponse<User | null>> {
  return await apiFindItemById<User>(
    "users",
    id,
    undefined,
    "Error al obtener usuario"
  );
}

export async function updateUserStatus(
  id: string,
  active: boolean
): Promise<ServiceResponse<User | null>> {
  const endpoint = active ? "activate" : "deactivate";
  return await generalApiCall<User>(
    `users/${id}/${endpoint}`,
    "POST",
    `Error al ${active ? "activar" : "desactivar"} usuario`
  );
}

/**
 * Obtiene el usuario actual (/me)
 */
export async function getMe(): Promise<ServiceResponse<User | null>> {
  return await generalApiCall<User>(
    "me",
    "GET",
    "Error al obtener el usuario actual"
  );
}
