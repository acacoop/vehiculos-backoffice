import type { User } from "./user";
import type { Vehicle } from "./vehicle";
import type { FilterParams } from "./common";
import type { QuarterlyControlItem } from "./quarterlyControlItem";
import type { VehicleKilometersLog } from "./kilometer";

export type Quarter = 1 | 2 | 3 | 4;

export interface QuarterlyControl {
  id: string;
  vehicle: Vehicle;
  year: number;
  quarter: Quarter;
  intendedDeliveryDate: string;
  filledBy: User | null;
  filledAt: string | null;
  kilometersLog: VehicleKilometersLog | null;
  items: QuarterlyControlItem[];
}

export interface QuarterlyControlInput {
  vehicleId: string;
  year: number;
  quarter: Quarter;
  intendedDeliveryDate: string;
}

export interface QuarterlyControlFilterParams extends FilterParams {
  vehicleId?: string;
  year?: number;
  quarter?: Quarter;
}
