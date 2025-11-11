import type { FilterParams } from "./common";
import type { User } from "./user";
import type { Vehicle } from "./vehicle";

export interface VehicleKilometersLog {
  id: string;
  vehicle: Vehicle;
  user: User;
  date: string;
  kilometers: number;
  createdAt?: string;
}

export interface VehicleKilometersLogInput {
  vehicleId: string;
  userId: string;
  date: string;
  kilometers: number;
}

export interface KilometersFilterParams extends FilterParams {
  startDate?: string;
  endDate?: string;
  search?: string;
}
