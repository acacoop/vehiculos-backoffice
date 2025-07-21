export interface Reservation {
  id: string; // UUID format
  vehicleId: string;
  userId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

// Parámetros para filtrar reservas (camelCase para uso interno)
export interface ReservationFilterParams {
  vehicleId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Respuesta específica para reservas
export interface ReservationsApiResponse {
  status: "success" | "error";
  message: string;
  data: Reservation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
