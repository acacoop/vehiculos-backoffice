import {
  httpService,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";
import type {
  VehicleModelType,
  VehicleModelListResponse,
} from "../types/vehicle";

interface ModelFilterParams {
  name?: string;
  brandId?: string;
  page?: number;
  limit?: number;
}

function buildQuery(params?: ModelFilterParams): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  if (params.name) usp.append("name", params.name);
  if (params.brandId) usp.append("brandId", params.brandId);
  if (params.page) usp.append("page", String(params.page));
  if (params.limit) usp.append("limit", String(params.limit));
  return usp.toString();
}

export async function getVehicleModels(
  params?: ModelFilterParams
): Promise<ServiceResponse<VehicleModelListResponse>> {
  try {
    const qs = buildQuery(params);
    const response: BackendResponse<any> = await httpService.get({
      uri: `/vehicle-models${qs ? `?${qs}` : ""}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: { items: [], total: 0 },
        message: response.message || "Error al obtener modelos",
      };
    }

    const rawItems: any[] = Array.isArray(response.data)
      ? (response.data as any[])
      : response.data?.items || [];

    const items: VehicleModelType[] = rawItems.map((it: any) => ({
      id: it.id,
      name: it.name,
      vehicleType: it.vehicleType || it.vehicle_type,
      brand: it.brand,
    }));
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
      message: "Error al obtener modelos",
      error: error as any,
    };
  }
}

export async function getVehicleModelById(
  id: string
): Promise<ServiceResponse<VehicleModelType>> {
  try {
    const response: BackendResponse<VehicleModelType> = await httpService.get({
      uri: `/vehicle-models/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleModelType,
        message: response.message || "Error al obtener modelo",
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleModelType,
      message: "Error al obtener modelo",
      error: error as any,
    };
  }
}

export async function createVehicleModel(
  name: string,
  brandId: string,
  vehicleType?: string
): Promise<ServiceResponse<VehicleModelType>> {
  try {
    const response: BackendResponse<VehicleModelType> = await httpService.post({
      uri: "/vehicle-models",
      body: { name, brandId, vehicleType },
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleModelType,
        message: response.message || "Error al crear modelo",
      };
    }

    return { success: true, data: response.data, message: "Modelo creado" };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleModelType,
      message: "Error al crear modelo",
      error: error as any,
    };
  }
}

export async function updateVehicleModel(
  id: string,
  name: string,
  brandId?: string,
  vehicleType?: string
): Promise<ServiceResponse<VehicleModelType>> {
  try {
    const body: Record<string, any> = { name };
    if (brandId) body.brandId = brandId;
    if (vehicleType !== undefined) body.vehicleType = vehicleType;
    const response: BackendResponse<VehicleModelType> = await httpService.patch(
      {
        uri: `/vehicle-models/${id}`,
        body,
      }
    );

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as VehicleModelType,
        message: response.message || "Error al actualizar modelo",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Modelo actualizado",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as VehicleModelType,
      message: "Error al actualizar modelo",
      error: error as any,
    };
  }
}

export async function deleteVehicleModel(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const response: BackendResponse<{ success: boolean }> =
      await httpService.delete({
        uri: `/vehicle-models/${id}`,
      });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: false,
        message: response.message || "Error al eliminar modelo",
      };
    }

    return { success: true, data: true, message: "Modelo eliminado" };
  } catch (error) {
    return {
      success: false,
      data: false,
      message: "Error al eliminar modelo",
      error: error as any,
    };
  }
}
