import type {
  Reservation,
  ReservationFilterParams,
} from "../types/reservation";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

/**
 * Obtiene todas las reservas (sin paginación)
 */
export async function getAllReservations(
  params?: ReservationFilterParams
): Promise<ServiceResponse<Reservation[]>> {
  try {
    const queryParams = buildQueryParams(params);
    const response: BackendResponse<Reservation[]> = await httpService.get({
      uri: `/reservations?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener reservas",
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
      message: "Error al obtener reservas",
      error: error as any,
    };
  }
}

/**
 * Obtiene reservas con paginación
 */
export async function getReservations(
  params?: ReservationFilterParams,
  pagination?: PaginationParams
): Promise<ServiceResponse<Reservation[]>> {
  try {
    const queryParams = buildQueryParams(params, pagination);
    console.log(
      "🔄 Llamando al servicio con:",
      `/reservations?${queryParams.toString()}`
    );

    const response = await httpService.get({
      uri: `/reservations?${queryParams.toString()}`,
    });

    console.log("📡 Respuesta cruda del httpService:", response);

    // El httpService devuelve directamente el array de datos
    // No está envuelto en BackendResponse como esperábamos
    let reservations: Reservation[] = [];

    if (Array.isArray(response)) {
      reservations = response;
    } else if (response && typeof response === "object" && response.data) {
      reservations = Array.isArray(response.data) ? response.data : [];
    } else {
      reservations = [];
    }

    console.log("📋 Reservas procesadas:", reservations);

    return {
      success: true,
      data: reservations,
      pagination: {
        page: 1,
        pageSize: 20,
        total: reservations.length,
        pages: 1,
      },
    };
  } catch (error) {
    console.error("❌ Error en getReservations:", error);
    return {
      success: false,
      data: [],
      message: "Error al obtener reservas",
      error: error as any,
    };
  }
}

/**
 * Obtiene una reserva por ID
 */
export async function getReservationById(
  id: string
): Promise<ServiceResponse<Reservation>> {
  try {
    const response: BackendResponse<Reservation> = await httpService.get({
      uri: `/reservations/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Reservation,
        message: response.message || "Error al obtener reserva",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Reservation,
      message: "Error al obtener reserva",
      error: error as any,
    };
  }
}

/**
 * Actualiza una reserva
 */
export async function updateReservation(
  id: string,
  reservationData: Partial<Omit<Reservation, "id">>
): Promise<ServiceResponse<Reservation>> {
  try {
    console.log(`🔄 Actualizando reserva ${id} con:`, reservationData);

    const response: BackendResponse<Reservation> = await httpService.patch({
      uri: `/reservations/${id}`,
      body: reservationData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Reservation,
        message: response.message || "Error al actualizar reserva",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Reserva actualizada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Reservation,
      message: "Error al actualizar reserva",
      error: error as any,
    };
  }
}

/**
 * Crea una nueva reserva
 */
export async function createReservation(
  reservationData: Omit<Reservation, "id">
): Promise<ServiceResponse<Reservation>> {
  try {
    console.log("📝 Creando nueva reserva:", reservationData);

    const response: BackendResponse<Reservation> = await httpService.post({
      uri: "/reservations",
      body: reservationData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Reservation,
        message: response.message || "Error al crear reserva",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Reserva creada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Reservation,
      message: "Error al crear reserva",
      error: error as any,
    };
  }
}

/**
 * Elimina una reserva
 */
export async function deleteReservation(
  id: string
): Promise<ServiceResponse<void>> {
  try {
    console.log(`🗑️ Eliminando reserva ${id}`);

    const response: BackendResponse<void> = await httpService.delete({
      uri: `/reservations/${id}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: undefined,
        message: response.message || "Error al eliminar reserva",
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Reserva eliminada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: undefined,
      message: "Error al eliminar reserva",
      error: error as any,
    };
  }
}
