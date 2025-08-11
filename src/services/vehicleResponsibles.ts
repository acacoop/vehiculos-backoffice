import type { ServiceResponse } from "../common";
import type { PaginationParams } from "../common";

export async function getVehicleResponsibles(
  pagination?: PaginationParams
): Promise<ServiceResponse<any[]>> {
  try {
    let url = "/vehicle-responsibles";
    if (pagination) {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      url += `?${params.toString()}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener responsables de vehículos",
    };
  }
}
