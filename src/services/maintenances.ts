import type {
  Maintenance,
} from "../types/maintenance";
import {
  type PaginationParams,
  type ServiceResponse,
  API_CONFIG,
} from "../common";

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

/**
 * Obtener mantenimientos asignados a un vehículo específico
 */
export const getVehicleMaintenances = async (vehicleId: string) => {
  try {
    console.log(
      `📍 [MAINTENANCE] Obteniendo mantenimientos del vehículo ${vehicleId}...`
    );

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/vehicles/${vehicleId}/maintenances`
    );
    console.log("📡 [MAINTENANCE] Respuesta del servidor:", response.status);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      "✅ [MAINTENANCE] Mantenimientos del vehículo obtenidos:",
      data
    );

    // Si el backend devuelve array directamente
    if (Array.isArray(data)) {
      return {
        success: true,
        data,
        message: "Mantenimientos del vehículo obtenidos exitosamente",
      };
    }

    // Si viene encapsulado en un objeto
    return {
      success: true,
      data: data.data || [],
      message: "Mantenimientos del vehículo obtenidos exitosamente",
    };
  } catch (error) {
    console.error(
      "💥 [MAINTENANCE] Error al obtener mantenimientos del vehículo:",
      error
    );
    return {
      success: false,
      data: [],
      message: "Error al obtener mantenimientos del vehículo",
      error: error as any,
    };
  }
};

/**
 * Guardar mantenimientos de un vehículo en lote
 */
export const saveVehicleMaintenances = async (
  vehicleId: string,
  maintenanceIds: string[]
) => {
  try {
    console.log(
      `📍 [MAINTENANCE] Guardando mantenimientos del vehículo ${vehicleId}...`
    );
    console.log(`🔧 [MAINTENANCE] Mantenimientos a guardar:`, maintenanceIds);

    const url = `${API_CONFIG.BASE_URL}/vehicles/${vehicleId}/maintenances`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maintenanceIds: maintenanceIds,
      }),
    });

    console.log("📡 [MAINTENANCE] Respuesta del servidor:", response.status);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      `✅ [MAINTENANCE] Mantenimientos guardados exitosamente:`,
      data
    );

    return {
      success: true,
      data,
      message: "Mantenimientos guardados exitosamente",
    };
  } catch (error) {
    console.error("💥 [MAINTENANCE] Error al guarrar mantenimientos:", error);
    return {
      success: false,
      data: null,
      message: "Error al guardar mantenimientos",
      error: error as any,
    };
  }
};
