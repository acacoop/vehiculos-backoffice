import type { ChartDataItem } from "../../components/Charts";
import type {
  VehicleCountData,
  BucketListData,
  DistributionListData,
  TimelineData,
  QuarterlyControlMetricsData,
  PersonnelMetric,
} from "../../services/metrics";

// ============================================
// Tipos para datos de gráficos
// ============================================

/** Datos de kilómetros/antigüedad para bar chart */
export interface BucketChartData extends ChartDataItem {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

/** Datos de distribución (marca, combustible) para pie chart */
export interface DistributionChartData extends ChartDataItem {
  id: string | null;
  name: string;
  count: number;
}

/** Datos de timeline para line/area charts */
export interface TimelineChartData extends ChartDataItem {
  month: string;
  count: number;
}

/** Datos de controles trimestrales para stacked bar chart */
export interface QuarterlyControlChartData extends ChartDataItem {
  label: string;
  year: number;
  quarter: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
  vencidos: number;
  total: number;
}

// ============================================
// Estado del componente
// ============================================

export interface MetricsState {
  vehicleCount: VehicleCountData | null;
  vehiclesByKilometers: BucketListData | null;
  vehiclesByAge: BucketListData | null;
  vehiclesByFuelType: DistributionListData | null;
  vehiclesByBrand: DistributionListData | null;
  reservationsTimeline: TimelineData | null;
  maintenanceTimeline: TimelineData | null;
  quarterlyControls: QuarterlyControlMetricsData | null;
  driversMetrics: PersonnelMetric | null;
  responsiblesMetrics: PersonnelMetric | null;
}

export const INITIAL_METRICS_STATE: MetricsState = {
  vehicleCount: null,
  vehiclesByKilometers: null,
  vehiclesByAge: null,
  vehiclesByFuelType: null,
  vehiclesByBrand: null,
  reservationsTimeline: null,
  maintenanceTimeline: null,
  quarterlyControls: null,
  driversMetrics: null,
  responsiblesMetrics: null,
};
