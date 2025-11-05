import { type ServiceResponse } from "../common";
import {
  apiCreateItem,
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";
import type {
  Category,
  CategoryFilterParams,
  CategoryInput,
} from "../types/category";

export async function getMaintenanceCategories(
  findOptions?: ApiFindOptions<CategoryFilterParams>,
): Promise<ServiceResponse<Category[]>> {
  return await apiFindItems<Category, CategoryFilterParams>({
    uri: "/maintenance/categories",
    findOptions,
    errorMessage: "Error al obtener categorías de mantenimiento",
  });
}

export async function getMaintenanceCategoriesById(
  id: string,
): Promise<ServiceResponse<Category>> {
  return await apiFindItemById<Category>({
    uri: "/maintenance/categories",
    itemId: id,
    errorMessage: "Error al obtener categoría de mantenimiento",
  });
}

export async function createMaintenanceCategory(
  payload: CategoryInput,
): Promise<ServiceResponse<Category>> {
  return await apiCreateItem<Category>({
    uri: "/maintenance/categories",
    payload,
    errorMessage: "Error al crear categoría de mantenimiento",
  });
}

export async function updateMaintenanceCategory(
  id: string,
  payload: CategoryInput,
): Promise<ServiceResponse<Category>> {
  return await apiUpdateItem<Category>({
    uri: "/maintenance/categories",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar categoría de mantenimiento",
  });
}
