import type { FilterParams } from "./common";
import type { User } from "./user";
import type { Vehicle } from "./vehicle";

export interface Reservation {
  id: string;
  vehicle: Vehicle;
  user: User;
  startDate: string;
  endDate: string;
}

export interface ReservationInput {
  vehicleId: string;
  userId: string;
  startDate: string;
  endDate: string;
}

export interface ReservationFilterParams extends FilterParams {
  vehicleId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}
