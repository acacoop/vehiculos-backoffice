import type { ServiceResponse } from "../types/common";
import type {
  QuarterlyControl,
  QuarterlyControlFilterParams,
  QuarterlyControlInput,
} from "../types/quarterlyControl";

import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  apiCreateItem,
  type ApiFindOptions,
} from "./common";

export async function getQuarterlyControls(
  findOptions?: ApiFindOptions<QuarterlyControlFilterParams>,
): Promise<ServiceResponse<QuarterlyControl[]>> {
  return await apiFindItems<QuarterlyControl, QuarterlyControlFilterParams>({
    uri: "quarterly-controls",
    findOptions,
    errorMessage: "Error al obtener controles trimestrales",
  });
}

export async function getQuarterlyControlById(
  id: string,
): Promise<ServiceResponse<QuarterlyControl>> {
  return await apiFindItemById<QuarterlyControl>({
    uri: "quarterly-controls",
    itemId: id,
    errorMessage: "Error al obtener control trimestral",
  });
}

export async function createQuarterlyControl(
  payload: QuarterlyControlInput,
): Promise<ServiceResponse<QuarterlyControl>> {
  return await apiCreateItem<QuarterlyControl>({
    uri: "quarterly-controls",
    payload,
    errorMessage: "Error al crear control trimestral",
  });
}

export async function updateQuarterlyControl(
  id: string,
  payload: QuarterlyControlInput,
): Promise<ServiceResponse<QuarterlyControl>> {
  return await apiUpdateItem<QuarterlyControl>({
    uri: "quarterly-controls",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar control trimestral",
  });
}

export async function deleteQuarterlyControl(
  id: string,
): Promise<ServiceResponse<QuarterlyControl>> {
  return await apiDeleteItem<QuarterlyControl>({
    uri: "quarterly-controls",
    itemId: id,
    errorMessage: "Error al eliminar control trimestral",
  });
}
