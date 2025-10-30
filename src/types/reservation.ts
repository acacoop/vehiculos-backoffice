export interface Reservation {
  id: string; // UUID format
  vehicleId: string;
  userId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

// Reserva con información del vehículo incluida
export interface ReservationWithVehicle extends Reservation {
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
  };
}

// Reserva con información del usuario incluida
export interface ReservationWithUser extends Reservation {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    cuit: number;
    email: string;
  };
}

// Reserva con información completa del usuario y vehículo
export interface ReservationWithDetails extends Reservation {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    cuit: number;
    email: string;
    active?: boolean;
  };
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    imgUrl?: string;
  };
}

// Parámetros para filtrar reservas (camelCase para uso interno)
export interface ReservationFilterParams {
  vehicleId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
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
