import {
  httpService,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";
import type { VehicleBrand, VehicleBrandListResponse } from "../types/vehicle";

interface BrandFilterParams {
  name?: string;
  page?: number;
  limit?: number;
}

function buildQuery(params?: BrandFilterParams): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  if (params.name) usp.append("name", params.name);
  if (params.page) usp.append("page", String(params.page));
  if (params.limit) usp.append("limit", String(params.limit));
  return usp.toString();
}

export async function getVehicleBrands(
  params?: BrandFilterParams
): Promise<ServiceResponse<VehicleBrandListResponse>> {
  try {
    const qs = buildQuery(params);
    const response: BackendResponse<any> = await httpService.get({
      uri: `/vehicle-brands${qs ? `?${qs}` : ""}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: { items: [], total: 0 },
        message: response.message || "Error al obtener marcas",
      };
    }

    // Nueva forma: data es un array y total viene en pagination.total
    const items: VehicleBrand[] = Array.isArray(response.data)
      ? (response.data as VehicleBrand[])
      : response.data?.items || [];
    const total: number =
      response.pagination?.total || response.data?.total || items.length;

    return {
      success: true,
      data: { items, total },
    };
  } catch (error) {
    return {
      success: false,
      data: { items: [], total: 0 },
      message: "Error al obtener marcas",
      error: error as any,
    };
  }
}

export async function getVehicleBrandById(
  id: string
): Promise<ServiceResponse<VehicleBrand>> {
  try {
    const response: BackendResponse<VehicleBrand> = await httpService.get({
      uri: `/vehicle-brands/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleBrand,
        message: response.message || "Error al obtener marca",
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleBrand,
      message: "Error al obtener marca",
      error: error as any,
    };
  }
}

export async function createVehicleBrand(
  name: string
): Promise<ServiceResponse<VehicleBrand>> {
  try {
    const response: BackendResponse<VehicleBrand> = await httpService.post({
      uri: "/vehicle-brands",
      body: { name },
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleBrand,
        message: response.message || "Error al crear marca",
      };
    }

    return { success: true, data: response.data, message: "Marca creada" };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleBrand,
      message: "Error al crear marca",
      error: error as any,
    };
  }
}

export async function updateVehicleBrand(
  id: string,
  name: string
): Promise<ServiceResponse<VehicleBrand>> {
  try {
    const response: BackendResponse<VehicleBrand> = await httpService.patch({
      uri: `/vehicle-brands/${id}`,
      body: { name },
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleBrand,
        message: response.message || "Error al actualizar marca",
      };
    }

    return { success: true, data: response.data, message: "Marca actualizada" };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleBrand,
      message: "Error al actualizar marca",
      error: error as any,
    };
  }
}

export async function deleteVehicleBrand(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const response: BackendResponse<{ success: boolean }> =
      await httpService.delete({
        uri: `/vehicle-brands/${id}`,
      });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: false,
        message: response.message || "Error al eliminar marca",
      };
    }

    return { success: true, data: true, message: "Marca eliminada" };
  } catch (error) {
    return {
      success: false,
      data: false,
      message: "Error al eliminar marca",
      error: error as any,
    };
  }
}
