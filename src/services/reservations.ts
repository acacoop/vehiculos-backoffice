import type { ServiceResponse } from "../types/common";
import type {
  Reservation,
  ReservationInput,
  ReservationFilterParams,
} from "../types/reservation";
import {
  apiFindItems,
  apiFindItemById,
  apiCreateItem,
  apiUpdateItem,
  apiDeleteItem,
  type ApiFindOptions,
} from "./common";

export async function getReservations(
  findOptions?: ApiFindOptions<ReservationFilterParams>,
): Promise<ServiceResponse<Reservation[]>> {
  return await apiFindItems({
    uri: "reservations",
    findOptions,
    errorMessage: "Error al obtener reservas",
  });
}

export async function getReservationById(
  id: string,
): Promise<ServiceResponse<Reservation>> {
  return await apiFindItemById({
    uri: "reservations",
    itemId: id,
    errorMessage: "Error al obtener reserva",
  });
}

export async function createReservation(
  payload: ReservationInput,
): Promise<ServiceResponse<Reservation>> {
  return await apiCreateItem({
    uri: "reservations",
    payload,
    errorMessage: "Error al crear reserva",
  });
}

export async function updateReservation(
  id: string,
  payload: Partial<ReservationInput>,
): Promise<ServiceResponse<Reservation>> {
  return await apiUpdateItem({
    uri: "reservations",
    itemId: id,
    payload,
    errorMessage: "Error al actualizar reserva",
  });
}

export async function deleteReservation(
  id: string,
): Promise<ServiceResponse<Reservation>> {
  return await apiDeleteItem<Reservation>({
    uri: "reservations",
    itemId: id,
    errorMessage: "Error al eliminar reserva",
  });
}
