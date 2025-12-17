import type { ServiceResponse, FilterParams } from "../types/common";
import { apiFindItems, generalApiCall, type ApiFindOptions } from "./common";

// ============================================
// Types from Backend API
// ============================================

export interface RisksSummary {
  key: string;
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
}

export interface VehicleWithoutResponsible {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  lastResponsibleEndDate?: string;
}

// Overdue maintenance requirement (grouped by requirement)
export interface OverdueMaintenanceRequirement {
  id: string;
  maintenanceRequirementId: string;
  maintenanceId: string;
  maintenanceName: string;
  modelId: string;
  modelName: string;
  brandName: string;
  daysFrequency?: number;
  kilometersFrequency?: number;
  affectedVehiclesCount: number;
  vehicles: OverdueMaintenanceVehicle[];
}

export interface OverdueMaintenanceVehicle {
  vehicleId: string;
  vehicleLicensePlate: string;
  dueDate?: string;
  dueKilometers?: number;
  currentKilometers?: number;
  daysOverdue?: number;
  kilometersOverdue?: number;
}

export interface OverdueQuarterlyControl {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  year: number;
  quarter: number;
  intendedDeliveryDate: string;
  daysOverdue: number;
}

export interface QuarterlyControlWithErrors {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  year: number;
  quarter: number;
  rejectedItemsCount: number;
}

export interface VehicleWithoutRecentKilometers {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  lastKilometerDate?: string;
  lastKilometers?: number;
  daysSinceLastUpdate: number;
}

// ============================================
// Query Parameters / Filters
// ============================================

export interface RiskFiltersQuery {
  toleranceDays?: number;
  daysWithoutUpdate?: number;
}

export type VehiclesWithoutResponsibleFilters = FilterParams;

export interface OverdueMaintenanceFilters extends FilterParams {
  toleranceDays?: number;
  maintenanceId?: string;
  modelId?: string;
}

export interface OverdueQuarterlyControlsFilters extends FilterParams {
  toleranceDays?: number;
  year?: number;
  quarter?: number;
}

export interface QuarterlyControlsWithErrorsFilters extends FilterParams {
  year?: number;
  quarter?: number;
  minRejectedItems?: number;
}

export interface VehiclesWithoutRecentKilometersFilters extends FilterParams {
  daysWithoutUpdate?: number;
}

// ============================================
// API Functions
// ============================================

const buildQueryString = (params: RiskFiltersQuery): URLSearchParams => {
  const usp = new URLSearchParams();
  if (params.toleranceDays !== undefined) {
    usp.set("toleranceDays", params.toleranceDays.toString());
  }
  if (params.daysWithoutUpdate !== undefined) {
    usp.set("daysWithoutUpdate", params.daysWithoutUpdate.toString());
  }
  return usp;
};

export async function getRisksSummary(
  params: RiskFiltersQuery = {},
): Promise<ServiceResponse<RisksSummary[]>> {
  return generalApiCall<RisksSummary[]>({
    uri: "risks/summary",
    method: "GET",
    usp: buildQueryString(params),
    errorMessage: "Error al obtener el resumen de riesgos",
  });
}

export async function getVehiclesWithoutResponsible(
  findOptions?: ApiFindOptions<VehiclesWithoutResponsibleFilters>,
): Promise<ServiceResponse<VehicleWithoutResponsible[]>> {
  return apiFindItems<
    VehicleWithoutResponsible,
    VehiclesWithoutResponsibleFilters
  >({
    uri: "risks/vehicles-without-responsible",
    findOptions,
    errorMessage: "Error al obtener vehículos sin responsable",
  });
}

export async function getOverdueMaintenance(
  findOptions?: ApiFindOptions<OverdueMaintenanceFilters>,
): Promise<ServiceResponse<OverdueMaintenanceRequirement[]>> {
  return apiFindItems<OverdueMaintenanceRequirement, OverdueMaintenanceFilters>(
    {
      uri: "risks/overdue-maintenance",
      findOptions,
      paramsConfig: [
        { field: "toleranceDays" },
        { field: "maintenanceId" },
        { field: "modelId" },
      ],
      errorMessage: "Error al obtener mantenimientos vencidos",
    },
  );
}

export async function getOverdueQuarterlyControls(
  findOptions?: ApiFindOptions<OverdueQuarterlyControlsFilters>,
): Promise<ServiceResponse<OverdueQuarterlyControl[]>> {
  return apiFindItems<OverdueQuarterlyControl, OverdueQuarterlyControlsFilters>(
    {
      uri: "risks/overdue-quarterly-controls",
      findOptions,
      paramsConfig: [
        { field: "toleranceDays" },
        { field: "year" },
        { field: "quarter" },
      ],
      errorMessage: "Error al obtener controles trimestrales vencidos",
    },
  );
}

export async function getQuarterlyControlsWithErrors(
  findOptions?: ApiFindOptions<QuarterlyControlsWithErrorsFilters>,
): Promise<ServiceResponse<QuarterlyControlWithErrors[]>> {
  return apiFindItems<
    QuarterlyControlWithErrors,
    QuarterlyControlsWithErrorsFilters
  >({
    uri: "risks/quarterly-controls-with-errors",
    findOptions,
    paramsConfig: [
      { field: "year" },
      { field: "quarter" },
      { field: "minRejectedItems" },
    ],
    errorMessage: "Error al obtener controles con errores",
  });
}

export async function getVehiclesWithoutRecentKilometers(
  findOptions?: ApiFindOptions<VehiclesWithoutRecentKilometersFilters>,
): Promise<ServiceResponse<VehicleWithoutRecentKilometers[]>> {
  return apiFindItems<
    VehicleWithoutRecentKilometers,
    VehiclesWithoutRecentKilometersFilters
  >({
    uri: "risks/vehicles-without-recent-kilometers",
    findOptions,
    paramsConfig: [{ field: "daysWithoutUpdate" }],
    errorMessage: "Error al obtener vehículos sin registro de km reciente",
  });
}
