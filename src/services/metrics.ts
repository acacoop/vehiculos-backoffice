import type { ServiceResponse } from "../types/common";
import { generalApiCall } from "./common";

// ============================================
// Types from Backend API
// ============================================

/** Bucket for kilometer/age groupings */
export interface Bucket {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

/** Distribution item (brand, fuel type, etc.) */
export interface DistributionItem {
  id: string | null;
  name: string;
  count: number;
}

/** Timeline item for monthly data */
export interface TimelineItem {
  month: string;
  count: number;
}

/** Quarterly control metric */
export interface QuarterlyControlMetric {
  year: number;
  quarter: number;
  label: string;
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
  vencidos: number;
}

/** Personnel metric (drivers/responsibles) */
export interface PersonnelMetric {
  totalActual: number;
  timeline: TimelineItem[];
}

// ============================================
// Response Types
// ============================================

export interface VehicleCountData {
  total: number;
}

export interface BucketListData {
  buckets: Bucket[];
}

export interface DistributionListData {
  distribution: DistributionItem[];
}

export interface TimelineData {
  timeline: TimelineItem[];
}

export interface QuarterlyControlMetricsData {
  metrics: QuarterlyControlMetric[];
}

// ============================================
// Query Parameters
// ============================================

export interface KilometersMetricsQuery {
  bucketSize?: number;
  maxBuckets?: number;
}

export interface AgeMetricsQuery {
  bucketSize?: number;
  maxBuckets?: number;
}

export interface TimelineMetricsQuery {
  months?: number;
}

export interface QuarterlyControlMetricsQuery {
  periods?: number;
}

export interface DistributionMetricsQuery {
  limit?: number;
}

// ============================================
// API Functions - Vehicle Metrics
// ============================================

/**
 * GET /metrics/vehicles/count
 * Returns total vehicle count
 */
export async function getVehicleCount(): Promise<
  ServiceResponse<VehicleCountData>
> {
  return generalApiCall<VehicleCountData>({
    uri: "metrics/vehicles/count",
    method: "GET",
    errorMessage: "Error al obtener el conteo de vehículos",
  });
}

/**
 * GET /metrics/vehicles/kilometers
 * Returns vehicles grouped by kilometer buckets
 */
export async function getVehiclesByKilometers(
  query?: KilometersMetricsQuery,
): Promise<ServiceResponse<BucketListData>> {
  const usp = new URLSearchParams();
  if (query?.bucketSize) usp.set("bucketSize", query.bucketSize.toString());
  if (query?.maxBuckets) usp.set("maxBuckets", query.maxBuckets.toString());

  return generalApiCall<BucketListData>({
    uri: "metrics/vehicles/kilometers",
    method: "GET",
    errorMessage: "Error al obtener métricas de kilómetros",
    usp: usp.toString() ? usp : undefined,
  });
}

/**
 * GET /metrics/vehicles/age
 * Returns vehicles grouped by age buckets
 */
export async function getVehiclesByAge(
  query?: AgeMetricsQuery,
): Promise<ServiceResponse<BucketListData>> {
  const usp = new URLSearchParams();
  if (query?.bucketSize) usp.set("bucketSize", query.bucketSize.toString());
  if (query?.maxBuckets) usp.set("maxBuckets", query.maxBuckets.toString());

  return generalApiCall<BucketListData>({
    uri: "metrics/vehicles/age",
    method: "GET",
    errorMessage: "Error al obtener métricas de antigüedad",
    usp: usp.toString() ? usp : undefined,
  });
}

/**
 * GET /metrics/vehicles/fuel-type
 * Returns vehicles grouped by fuel type
 */
export async function getVehiclesByFuelType(
  query?: DistributionMetricsQuery,
): Promise<ServiceResponse<DistributionListData>> {
  const usp = new URLSearchParams();
  if (query?.limit) usp.set("limit", query.limit.toString());

  return generalApiCall<DistributionListData>({
    uri: "metrics/vehicles/fuel-type",
    method: "GET",
    errorMessage: "Error al obtener métricas por tipo de combustible",
    usp: usp.toString() ? usp : undefined,
  });
}

/**
 * GET /metrics/vehicles/brand
 * Returns vehicles grouped by brand
 */
export async function getVehiclesByBrand(
  query?: DistributionMetricsQuery,
): Promise<ServiceResponse<DistributionListData>> {
  const usp = new URLSearchParams();
  if (query?.limit) usp.set("limit", query.limit.toString());

  return generalApiCall<DistributionListData>({
    uri: "metrics/vehicles/brand",
    method: "GET",
    errorMessage: "Error al obtener métricas por marca",
    usp: usp.toString() ? usp : undefined,
  });
}

// ============================================
// API Functions - Management Metrics
// ============================================

/**
 * GET /metrics/reservations
 * Returns reservations timeline by month
 */
export async function getReservationsTimeline(
  query?: TimelineMetricsQuery,
): Promise<ServiceResponse<TimelineData>> {
  const usp = new URLSearchParams();
  if (query?.months) usp.set("months", query.months.toString());

  return generalApiCall<TimelineData>({
    uri: "metrics/reservations",
    method: "GET",
    errorMessage: "Error al obtener timeline de reservas",
    usp: usp.toString() ? usp : undefined,
  });
}

/**
 * GET /metrics/maintenance-records
 * Returns maintenance records timeline by month
 */
export async function getMaintenanceRecordsTimeline(
  query?: TimelineMetricsQuery,
): Promise<ServiceResponse<TimelineData>> {
  const usp = new URLSearchParams();
  if (query?.months) usp.set("months", query.months.toString());

  return generalApiCall<TimelineData>({
    uri: "metrics/maintenance-records",
    method: "GET",
    errorMessage: "Error al obtener timeline de mantenimientos",
    usp: usp.toString() ? usp : undefined,
  });
}

// ============================================
// API Functions - Quarterly Control Metrics
// ============================================

/**
 * GET /metrics/quarterly-controls
 * Returns quarterly controls by status
 */
export async function getQuarterlyControlsStatus(
  query?: QuarterlyControlMetricsQuery,
): Promise<ServiceResponse<QuarterlyControlMetricsData>> {
  const usp = new URLSearchParams();
  if (query?.periods) usp.set("periods", query.periods.toString());

  return generalApiCall<QuarterlyControlMetricsData>({
    uri: "metrics/quarterly-controls",
    method: "GET",
    errorMessage: "Error al obtener métricas de controles trimestrales",
    usp: usp.toString() ? usp : undefined,
  });
}

// ============================================
// API Functions - Personnel Metrics
// ============================================

/**
 * GET /metrics/drivers
 * Returns driver assignments metrics
 */
export async function getDriversMetrics(
  query?: TimelineMetricsQuery,
): Promise<ServiceResponse<PersonnelMetric>> {
  const usp = new URLSearchParams();
  if (query?.months) usp.set("months", query.months.toString());

  return generalApiCall<PersonnelMetric>({
    uri: "metrics/drivers",
    method: "GET",
    errorMessage: "Error al obtener métricas de conductores",
    usp: usp.toString() ? usp : undefined,
  });
}

/**
 * GET /metrics/responsibles
 * Returns vehicle responsibles metrics
 */
export async function getResponsiblesMetrics(
  query?: TimelineMetricsQuery,
): Promise<ServiceResponse<PersonnelMetric>> {
  const usp = new URLSearchParams();
  if (query?.months) usp.set("months", query.months.toString());

  return generalApiCall<PersonnelMetric>({
    uri: "metrics/responsibles",
    method: "GET",
    errorMessage: "Error al obtener métricas de responsables",
    usp: usp.toString() ? usp : undefined,
  });
}
