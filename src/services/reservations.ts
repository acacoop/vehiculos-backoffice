import type {
  Reservation,
  ReservationFilterParams,
  ReservationWithUser,
} from "../types/reservation";
import type { ServiceResponse } from "../common";
import {
  generalApiCall,
  apiFindAllItems,
  apiFindItemById,
  apiCreateItem,
  apiUpdateItem,
  apiDeleteItem,
  addApiFindOptions,
  type ApiFindOptions,
} from "./common";

// TODO: Este servicio tiene endpoints especiales:
// - GET /reservations/vehicle/{vehicleId} - Reservas por vehículo con usuario incluido
// - Verificar si existen endpoints /finish y /cancel

/**
 * Obtiene reservas con paginación y filtros
 */
export async function getReservations(
  findOptions?: ApiFindOptions<ReservationFilterParams>
): Promise<ServiceResponse<Reservation[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "userId" },
      { field: "vehicleId" },
      { field: "startDate" },
      { field: "endDate" },
      { field: "status" },
    ]);
  }

  return await apiFindAllItems<Reservation>(
    "reservations",
    params,
    undefined,
    "Error al obtener reservas"
  );
}

/**
 * Obtiene una reserva por ID
 */
export async function getReservationById(
  id: string
): Promise<ServiceResponse<Reservation | null>> {
  return await apiFindItemById<Reservation>(
    "reservations",
    id,
    undefined,
    "Error al obtener reserva"
  );
}

/**
 * Crea una nueva reserva
 */
export async function createReservation(
  payload: Omit<Reservation, "id">
): Promise<ServiceResponse<Reservation | null>> {
  return await apiCreateItem<Reservation>(
    "reservations",
    payload,
    undefined,
    "Error al crear reserva"
  );
}

/**
 * Actualiza una reserva
 */
export async function updateReservation(
  id: string,
  payload: Partial<Omit<Reservation, "id">>
): Promise<ServiceResponse<Reservation | null>> {
  return await apiUpdateItem<Reservation>(
    "reservations",
    id,
    payload,
    undefined,
    "Error al actualizar reserva"
  );
}

/**
 * Elimina una reserva
 */
export async function deleteReservation(
  id: string
): Promise<ServiceResponse<void | null>> {
  return await apiDeleteItem<void>(
    "reservations",
    id,
    undefined,
    "Error al eliminar reserva"
  );
}

/**
 * Obtiene reservas por vehículo con usuario incluido
 * TODO: Endpoint especial /reservations/vehicle/{vehicleId}
 */
export async function getReservationsByVehicle(
  vehicleId: string,
  findOptions?: ApiFindOptions<ReservationFilterParams>
): Promise<ServiceResponse<ReservationWithUser[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "startDate" },
      { field: "endDate" },
      { field: "status" },
    ]);
  }

  return await generalApiCall<ReservationWithUser[]>(
    `reservations/vehicle/${vehicleId}`,
    "GET",
    "Error al obtener reservas del vehículo",
    undefined,
    params
  );
}
