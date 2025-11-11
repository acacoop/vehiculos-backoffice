import type { User } from "./user";
import type { Vehicle } from "./vehicle";
import type { FilterParams } from "./common";

export interface Assignment {
  id: string;
  startDate: string;
  endDate: string | null;
  user: User;
  vehicle: Vehicle;
}

export interface AssignmentInput {
  userId: string;
  vehicleId: string;
  startDate?: string;
  endDate?: string | null;
  active?: boolean;
}

export interface AssignmentFilterParams extends FilterParams {
  userId?: string;
  vehicleId?: string;
  date?: string;
  active?: boolean;
}
