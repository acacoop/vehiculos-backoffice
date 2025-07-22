import type {
  Maintenance,
  MaintenanceFilterParams,
} from "../types/maintenance";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

/**
 * Obtiene todos los mantenimientos (sin paginación)
 */
export async function getAllMaintenances(
  params?: MaintenanceFilterParams
): Promise<ServiceResponse<Maintenance[]>> {
  try {
    const queryParams = buildQueryParams(params);
    const response: BackendResponse<Maintenance[]> = await httpService.get({
      uri: `/maintenances?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener mantenimientos",
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
      message: "Error al obtener mantenimientos",
      error: error as any,
    };
  }
}

/**
 * Obtiene mantenimientos con paginación
 */
export async function getMaintenances(
  params?: MaintenanceFilterParams,
  pagination?: PaginationParams
): Promise<ServiceResponse<Maintenance[]>> {
  try {
    const queryParams = buildQueryParams(params, pagination);
    const response: BackendResponse<Maintenance[]> = await httpService.get({
      uri: `/maintenances?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener mantenimientos",
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
      message: "Error al obtener mantenimientos",
      error: error as any,
    };
  }
}

/**
 * Obtiene un mantenimiento por ID
 */
export async function getMaintenanceById(
  id: string
): Promise<ServiceResponse<Maintenance>> {
  try {
    const response: BackendResponse<Maintenance> = await httpService.get({
      uri: `/maintenances/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Maintenance,
        message: response.message || "Error al obtener mantenimiento",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Maintenance,
      message: "Error al obtener mantenimiento",
      error: error as any,
    };
  }
}

/**
 * Actualiza un mantenimiento
 */
export async function updateMaintenance(
  id: string,
  maintenanceData: Partial<Omit<Maintenance, "id">>
): Promise<ServiceResponse<Maintenance>> {
  try {
    console.log(`🔄 Actualizando mantenimiento ${id} con:`, maintenanceData);

    const response: BackendResponse<Maintenance> = await httpService.patch({
      uri: `/maintenances/${id}`,
      body: maintenanceData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Maintenance,
        message: response.message || "Error al actualizar mantenimiento",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Mantenimiento actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Maintenance,
      message: "Error al actualizar mantenimiento",
      error: error as any,
    };
  }
}

/**
 * Obtiene todas las categorías de mantenimiento
 */
export async function getMaintenanceCategories(
  pagination?: PaginationParams
): Promise<ServiceResponse<Maintenance[]>> {
  try {
    let uri = "/maintenance/categories";

    if (pagination) {
      const params = new URLSearchParams();

      if (pagination.page) {
        params.append("page", pagination.page.toString());
      }
      if (pagination.limit) {
        params.append("limit", pagination.limit.toString());
      }

      const queryString = params.toString();
      if (queryString) {
        uri += `?${queryString}`;
      }
    }

    // Llamar directamente al fetch para evitar la transformación del httpService
    const baseUrl = "http://localhost:3000"; // Ajustar según tu configuración
    const fullUrl = `${baseUrl}${uri}`;

    console.log("🌐 [MAINTENANCE] URL completa:", fullUrl);

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    console.log("📨 [MAINTENANCE] Datos raw del backend:", rawData);
    console.log("📊 [MAINTENANCE] Tipo de datos raw:", typeof rawData);
    console.log("📊 [MAINTENANCE] Es array?", Array.isArray(rawData));

    // Verificar si es un array directo (como esperamos)
    if (Array.isArray(rawData)) {
      return {
        success: true,
        data: rawData as Maintenance[],
        message: "Categorías de mantenimiento obtenidas exitosamente",
      };
    }

    // Si no es array, manejar otros formatos
    if (
      rawData &&
      typeof rawData === "object" &&
      rawData.data &&
      Array.isArray(rawData.data)
    ) {
      return {
        success: true,
        data: rawData.data as Maintenance[],
        message:
          rawData.message ||
          "Categorías de mantenimiento obtenidas exitosamente",
      };
    }

    // Si no coincide con ningún formato esperado
    console.error(
      "❌ [MAINTENANCE] Formato de respuesta no reconocido:",
      rawData
    );
    return {
      success: false,
      data: [],
      message: "Formato de respuesta inesperado del servidor",
    };
  } catch (error) {
    console.error("💥 [MAINTENANCE] Error al obtener mantenimientos:", error);
    return {
      success: false,
      data: [],
      message: "Error al obtener categorías de mantenimiento",
      error: error as any,
    };
  }
}
