import type { User } from "./user";
import type { Vehicle } from "./vehicle";
import type { FilterParams } from "./common";
import type { MaintenanceChecklistItemInput } from "./maintenanceChecklistItem";

export type Quarter = 1 | 2 | 3 | 4;

export interface MaintenanceChecklist {
  id: string;
  vehicle: Vehicle;
  year: number;
  quarter: Quarter;
  intendedDeliveryDate: string;
  filledBy: User | null;
  filledAt: string | null;
  itemCount?: number;
  passedCount?: number;
  hasFailedItems?: boolean;
}

export interface MaintenanceChecklistInput {
  vehicleId: string;
  year: number;
  quarter: Quarter;
  intendedDeliveryDate: string;
}

export type MaintenanceChecklistFillPayload = {
  items: MaintenanceChecklistItemInput[];
};

export interface MaintenanceChecklistFilterParams extends FilterParams {
  vehicleId?: string;
  year?: number;
  quarter?: Quarter;
  hasFailedItems?: boolean;
}
