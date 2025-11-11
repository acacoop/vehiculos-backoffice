import type { FilterParams } from "./common";
import type { User } from "./user";
import type { Vehicle } from "./vehicle";

export interface VehicleResponsible {
  id: string;
  user: User;
  vehicle: Vehicle;
  startDate: string;
  endDate: string | null;
}

export interface VehicleResponsibleInput {
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate?: string | null;
}

export interface VehicleResponsibleFilterParams extends FilterParams {
  userId?: string;
  vehicleId?: string;
  active?: boolean;
  date?: string;
}
