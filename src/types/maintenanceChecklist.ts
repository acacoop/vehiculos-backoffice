import type { User } from "./user";
import type { Vehicle } from "./vehicle";

export type Quarter = 1 | 2 | 3 | 4;

export interface MaintenanceChecklist {
  id: string;
  vehicle: Vehicle;
  year: number;
  quarter: Quarter;
  intendedDeliveryDate: string;
  filledBy: User | null;
  filledAt: string | null;
}
