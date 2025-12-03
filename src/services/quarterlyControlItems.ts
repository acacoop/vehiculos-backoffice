import type { ServiceResponse } from "../types/common";
import type {
  QuarterlyControlItem,
  QuarterlyControlItemFilterParams,
  QuarterlyControlItemInput,
} from "../types/quarterlyControlItem";

import {
  apiFindItemById,
  apiFindItems,
  apiUpdateItem,
  apiDeleteItem,
  type ApiFindOptions,
} from "./common";

export async function getQuarterlyControlItems(
  findOptions?: ApiFindOptions<QuarterlyControlItemFilterParams>,
): Promise<ServiceResponse<QuarterlyControlItem[]>> {
  return await apiFindItems<
    QuarterlyControlItem,
    QuarterlyControlItemFilterParams
  >({
    uri: "quarterly-control-items",
    findOptions,
    errorMessage: "Error al obtener items de control trimestral",
  });
}

export async function getQuarterlyControlItemById(
  id: string,
): Promise<ServiceResponse<QuarterlyControlItem>> {
  return await apiFindItemById<QuarterlyControlItem>({
    uri: "quarterly-control-items",
    itemId: id,
    errorMessage: "Error al obtener item de control trimestral",
  });
}

export async function updateQuarterlyControlItem(
  id: string,
  payload: QuarterlyControlItemInput,
): Promise<ServiceResponse<QuarterlyControlItem>> {
  return await apiUpdateItem<QuarterlyControlItem>({
    uri: "quarterly-control-items",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar item de control trimestral",
  });
}

export async function deleteQuarterlyControlItem(
  id: string,
): Promise<ServiceResponse<QuarterlyControlItem>> {
  return await apiDeleteItem<QuarterlyControlItem>({
    uri: "quarterly-control-items",
    itemId: id,
    errorMessage: "Error al eliminar item de control trimestral",
  });
}
