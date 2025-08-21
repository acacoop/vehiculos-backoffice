import type {
  Reservation,
  ReservationFilterParams,
  ReservationWithUser,
} from "../types/reservation";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

export async function getAllReservations(
  params?: ReservationFilterParams
): Promise<ServiceResponse<Reservation[]>> {
  try {
    const queryParams = buildQueryParams(params, { limit: 1000 });
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

    const response = await httpService.get({
      uri: `/reservations?${queryParams.toString()}`,
    });

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
    // Estrategia 1: Intentar endpoint específico por ID
    try {
      const directResponse: BackendResponse<Reservation> =
        await httpService.get({
          uri: `/reservations/${id}`,
        });

      if (
        directResponse.status !== ResponseStatus.ERROR &&
        directResponse.data
      ) {
        return {
          success: true,
          data: directResponse.data,
        };
      }
    } catch (directError) {
      // Endpoint directo no disponible, continuar con fallback
    }

    // Estrategia 2: Usar lista completa (fallback)
    const allReservationsResponse = await getAllReservations();

    if (allReservationsResponse.success) {
      const reservation = allReservationsResponse.data.find((r) => r.id === id);

      if (reservation) {
        return {
          success: true,
          data: reservation,
        };
      } else {
        return {
          success: false,
          data: {} as Reservation,
          message: `Reserva con ID ${id} no encontrada en ${allReservationsResponse.data.length} reservas disponibles`,
        };
      }
    } else {
      return {
        success: false,
        data: {} as Reservation,
        message: allReservationsResponse.message || "Error al obtener reservas",
      };
    }
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
    let response: BackendResponse<Reservation>;
    let lastError: any;

    // Estrategia 1: Intentar PATCH
    try {
      response = await httpService.patch({
        uri: `/reservations/${id}`,
        body: reservationData,
      });

      if (response.status !== ResponseStatus.ERROR) {
        return {
          success: true,
          data: response.data,
          message: "Reserva actualizada exitosamente",
        };
      }
    } catch (patchError) {
      lastError = patchError;
    }

    // Estrategia 2: Intentar PUT
    try {
      response = await httpService.put({
        uri: `/reservations/${id}`,
        body: { id, ...reservationData },
      });

      if (response.status !== ResponseStatus.ERROR) {
        return {
          success: true,
          data: response.data,
          message: "Reserva actualizada exitosamente",
        };
      }
    } catch (putError) {
      lastError = putError;
    }

    // Si ambas estrategias de actualización fallan
    return {
      success: false,
      data: {} as Reservation,
      message:
        "No se pudo actualizar la reserva - endpoints PATCH y PUT no disponibles",
      error: lastError,
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

/**
 * Obtiene reservas de un usuario específico con paginación
 */
export async function getReservationsByUser(
  userId: string,
  pagination?: PaginationParams
): Promise<ServiceResponse<Reservation[]>> {
  try {
    const queryParams = buildQueryParams({ userId }, pagination);

    const response = await httpService.get({
      uri: `/reservations?${queryParams.toString()}`,
    });

    // El httpService devuelve directamente el array de datos
    let reservations: Reservation[] = [];

    if (Array.isArray(response)) {
      reservations = response;
    } else if (response && typeof response === "object" && response.data) {
      reservations = Array.isArray(response.data) ? response.data : [];
    } else {
      reservations = [];
    }

    return {
      success: true,
      data: reservations,
      pagination: {
        page: pagination?.page || 1,
        pageSize: pagination?.limit || 20,
        total: reservations.length,
        pages: Math.ceil(reservations.length / (pagination?.limit || 20)),
      },
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener reservas del usuario",
      error: error as any,
    };
  }
}

/**
 * Obtiene reservas por vehículo con paginación
 */
export async function getReservationsByVehicle(
  vehicleId: string,
  params?: PaginationParams & ReservationFilterParams
): Promise<ServiceResponse<ReservationWithUser[]>> {
  try {
    const queryParams = buildQueryParams(params);
    const response: BackendResponse<ReservationWithUser[]> =
      await httpService.get({
        uri: `/reservations/vehicle/${vehicleId}?${queryParams.toString()}`,
      });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener reservas del vehículo",
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
      message: "Error al obtener reservas del vehículo",
      error: error as any,
    };
  }
}
