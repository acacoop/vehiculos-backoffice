import type { Maintenance } from "../types/maintenance";
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

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

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
    return {
      success: false,
      data: [],
      message: "Formato de respuesta inesperado del servidor",
    };
  } catch (error) {
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
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/assignments/${vehicleId}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Si el backend devuelve array directamente
    if (Array.isArray(data)) {
      return {
        success: true,
        data,
        message: "Mantenimientos del vehículo obtenidos exitosamente",
      };
    }

    // Si viene encapsulado en un objeto con status "success"
    if (data.status === "success") {
      return {
        success: true,
        data: data.data || [],
        message:
          data.message || "Mantenimientos del vehículo obtenidos exitosamente",
      };
    }

    // Si viene encapsulado en un objeto sin status
    return {
      success: true,
      data: data.data || [],
      message: "Mantenimientos del vehículo obtenidos exitosamente",
    };
  } catch (error) {
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

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      message: "Mantenimientos guardados exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: "Error al guardar mantenimientos",
      error: error as any,
    };
  }
};

/**
 * Obtener un mantenimiento específico por ID
 */
export const getMaintenanceById = async (
  id: string
): Promise<ServiceResponse<Maintenance>> => {
  try {
    // Intentar primero el endpoint específico
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/categories/${id}`
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data as Maintenance,
        message: "Mantenimiento obtenido exitosamente",
      };
    }

    // Si el endpoint específico falla, usar fallback con getAllMaintenances
    const allMaintenancesResponse = await getMaintenanceCategories();

    if (allMaintenancesResponse.success) {
      const maintenance = allMaintenancesResponse.data.find((m) => m.id === id);

      if (maintenance) {
        return {
          success: true,
          data: maintenance,
          message: "Mantenimiento obtenido exitosamente (fallback)",
        };
      } else {
        return {
          success: false,
          data: {} as Maintenance,
          message: "Mantenimiento no encontrado",
        };
      }
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    return {
      success: false,
      data: {} as Maintenance,
      message: "Error al obtener el mantenimiento",
      error: error as any,
    };
  }
};

/**
 * Crear un nuevo mantenimiento
 */
export const createMaintenance = async (
  maintenance: Omit<Maintenance, "id">
): Promise<ServiceResponse<Maintenance>> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(maintenance),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data as Maintenance,
      message: "Mantenimiento creado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Maintenance,
      message: "Error al crear el mantenimiento",
      error: error as any,
    };
  }
};

/**
 * Actualizar un mantenimiento existente
 */
export const updateMaintenance = async (
  id: string,
  maintenance: Partial<Maintenance>
): Promise<ServiceResponse<Maintenance>> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/categories/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(maintenance),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data as Maintenance,
      message: "Mantenimiento actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Maintenance,
      message: "Error al actualizar el mantenimiento",
      error: error as any,
    };
  }
};

/**
 * Eliminar una categoría de mantenimiento
 */
export const deleteMaintenance = async (
  id: string
): Promise<ServiceResponse<null>> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/categories/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      data: null,
      message: "Categoría eliminada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: "Error al eliminar la categoría",
      error: error as any,
    };
  }
};

/**
 * Interfaz para mantenimientos posibles con información de categoría
 */
interface MaintenancePossible {
  id: string;
  name: string;
  maintenanceCategoryName?: string; // Como viene del backend en camelCase
  maintenancecategoryname?: string; // Como realmente viene del backend en lowercase
}

/**
 * Interfaz normalizada para el frontend (ya viene en el formato correcto)
 */
export interface MaintenancePossibleNormalized {
  id: string;
  name: string;
  maintenanceCategoryName: string;
}

/**
 * Obtiene todos los mantenimientos posibles con información de categoría
 */
export async function getMaintenancePossibles(
  pagination?: PaginationParams
): Promise<ServiceResponse<MaintenancePossibleNormalized[]>> {
  try {
    const uri = "/maintenance/posibles";

    const response = await fetch(`${API_CONFIG.BASE_URL}${uri}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    // Procesar los datos según la estructura de tu controlador: { status: 'success', data: [...] }
    let dataArray: MaintenancePossible[] = [];

    if (rawData.status === "success" && rawData.data) {
      if (Array.isArray(rawData.data)) {
        dataArray = rawData.data;
      }
    } else if (Array.isArray(rawData)) {
      dataArray = rawData;
    }

    const normalizedData: MaintenancePossibleNormalized[] = dataArray.map(
      (item) => {
        return {
          id: item.id,
          name: item.name,
          maintenanceCategoryName:
            item.maintenancecategoryname ||
            item.maintenanceCategoryName ||
            "Sin categoría",
        };
      }
    );

    return {
      success: true,
      data: normalizedData,
      message: "Mantenimientos posibles obtenidos exitosamente",
    };
  } catch (error) {
    console.error("Error fetching maintenance possibles:", error);
    return {
      success: false,
      data: [],
      message:
        "Error al obtener mantenimientos posibles: " +
        (error instanceof Error ? error.message : String(error)),
      error: error as any,
    };
  }
}
