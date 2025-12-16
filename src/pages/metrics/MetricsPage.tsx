import { Chart, type ChartFilter } from "../../components/Charts";
import {
  getVehiclesByKilometers,
  getVehiclesByAge,
  getVehiclesByFuelType,
  getVehiclesByBrand,
  getReservationsTimeline,
  getMaintenanceRecordsTimeline,
  getQuarterlyControlsStatus,
  getDriversMetrics,
  getResponsiblesMetrics,
  type Bucket,
  type DistributionItem,
  type TimelineItem,
  type QuarterlyControlMetric,
} from "../../services/metrics";
import { useMetricsNavigation } from "./useMetricsNavigation";
import { COLORS } from "../../common";
import "./MetricsPage.css";

// ============================================
// Tipos de parámetros para cada chart
// ============================================

interface KilometersParams {
  bucketSize: number;
  maxBuckets: number;
}

interface AgeParams {
  bucketSize: number;
}

interface DistributionParams {
  limit: number;
}

interface TimelineParams {
  months: number;
}

interface QuarterlyParams {
  periods: number;
}

// ============================================
// Configuración de filtros
// ============================================

const kilometersFilters: ChartFilter<KilometersParams>[] = [
  {
    key: "bucketSize",
    label: "Agrupar cada",
    type: "select",
    defaultValue: 20000,
    options: [
      { value: 10000, label: "10,000 km" },
      { value: 20000, label: "20,000 km" },
      { value: 50000, label: "50,000 km" },
    ],
  },
  {
    key: "maxBuckets",
    label: "Máx grupos",
    type: "select",
    defaultValue: 7,
    options: [
      { value: 5, label: "5" },
      { value: 7, label: "7" },
      { value: 10, label: "10" },
    ],
  },
];

const ageFilters: ChartFilter<AgeParams>[] = [
  {
    key: "bucketSize",
    label: "Agrupar cada",
    type: "select",
    defaultValue: 1,
    options: [
      { value: 1, label: "1 año" },
      { value: 2, label: "2 años" },
      { value: 5, label: "5 años" },
    ],
  },
];

const brandFilters: ChartFilter<DistributionParams>[] = [
  {
    key: "limit",
    label: "Mostrar",
    type: "select",
    defaultValue: 10,
    options: [
      { value: 5, label: "5 marcas" },
      { value: 10, label: "10 marcas" },
      { value: 15, label: "15 marcas" },
      { value: 20, label: "20 marcas" },
    ],
  },
];

const fuelTypeFilters: ChartFilter<DistributionParams>[] = [
  {
    key: "limit",
    label: "Mostrar",
    type: "select",
    defaultValue: 10,
    options: [
      { value: 5, label: "5 tipos" },
      { value: 10, label: "10 tipos" },
    ],
  },
];

const timelineFilters: ChartFilter<TimelineParams>[] = [
  {
    key: "months",
    label: "Meses",
    type: "select",
    defaultValue: 12,
    options: [
      { value: 6, label: "6 meses" },
      { value: 12, label: "12 meses" },
      { value: 18, label: "18 meses" },
      { value: 24, label: "24 meses" },
    ],
  },
];

const quarterlyFilters: ChartFilter<QuarterlyParams>[] = [
  {
    key: "periods",
    label: "Trimestres",
    type: "select",
    defaultValue: 8,
    options: [
      { value: 4, label: "4 trimestres" },
      { value: 8, label: "8 trimestres" },
      { value: 12, label: "12 trimestres" },
    ],
  },
];

// ============================================
// Funciones de fetch para cada chart
// ============================================

const fetchKilometers = async (params: KilometersParams) => {
  const result = await getVehiclesByKilometers({
    bucketSize: params.bucketSize,
    maxBuckets: params.maxBuckets,
  });
  const data = result.success ? result.data.buckets : [];
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return { data, meta: { total } };
};

const fetchAge = async (params: AgeParams) => {
  const result = await getVehiclesByAge({
    bucketSize: params.bucketSize,
    maxBuckets: 10, // Fijo: mostrar hasta 10 grupos
  });
  const data = result.success ? result.data.buckets : [];
  return { data, meta: {} };
};

const fetchBrands = async (params: DistributionParams) => {
  const result = await getVehiclesByBrand({ limit: params.limit });
  const data = result.success ? result.data.distribution : [];
  return { data, meta: {} };
};

const fetchFuelTypes = async (params: DistributionParams) => {
  const result = await getVehiclesByFuelType({ limit: params.limit });
  const data = result.success ? result.data.distribution : [];
  return { data, meta: {} };
};

const fetchReservations = async (params: TimelineParams) => {
  const result = await getReservationsTimeline({ months: params.months });
  const data = result.success ? result.data.timeline : [];
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return { data, meta: { total } };
};

const fetchMaintenance = async (params: TimelineParams) => {
  const result = await getMaintenanceRecordsTimeline({ months: params.months });
  const data = result.success ? result.data.timeline : [];
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return { data, meta: { total } };
};

const fetchQuarterlyControls = async (params: QuarterlyParams) => {
  const result = await getQuarterlyControlsStatus({ periods: params.periods });
  const data = result.success ? result.data.metrics : [];
  return { data, meta: {} };
};

const fetchDrivers = async (params: TimelineParams) => {
  const result = await getDriversMetrics({ months: params.months });
  const data = result.success ? result.data.timeline : [];
  const total = result.success ? result.data.totalActual : 0;
  return { data, meta: { total } };
};

const fetchResponsibles = async (params: TimelineParams) => {
  const result = await getResponsiblesMetrics({ months: params.months });
  const data = result.success ? result.data.timeline : [];
  const total = result.success ? result.data.totalActual : 0;
  return { data, meta: { total } };
};

// ============================================
// Componente Principal
// ============================================

export default function MetricsPage() {
  const {
    handleKilometersClick,
    handleAgeClick,
    handleBrandClick,
    handleFuelTypeClick,
    handleReservationsClick,
  } = useMetricsNavigation();

  return (
    <div className="metrics-container">
      <div className="header-metrics">
        <h1 className="title">Métricas</h1>
      </div>

      <section className="metrics-section">
        <h2 className="section-title">Vehículos</h2>
        <div className="charts-grid charts-grid--2-cols">
          <Chart<Bucket, KilometersParams>
            title="Vehículos por Kilómetros"
            subtitle="Click en una barra para ver vehículos"
            footer={(meta) => (
              <span>
                <b>{meta.total as number}</b> vehículos totales
              </span>
            )}
            type="histogram"
            direction="vertical"
            fetchData={fetchKilometers}
            filters={kilometersFilters}
            config={{
              xAxisKey: "label",
              series: [{ dataKey: "count", name: "Vehículos" }],
              specialCategories: ["Sin registro"],
            }}
            onElementClick={handleKilometersClick}
          />

          <Chart<Bucket, AgeParams>
            title="Vehículos por Antigüedad"
            subtitle="Click en una barra para ver vehículos"
            footer={<span>Agrupados por años de antigüedad</span>}
            type="histogram"
            direction="vertical"
            fetchData={fetchAge}
            filters={ageFilters}
            config={{
              xAxisKey: "label",
              series: [{ dataKey: "count", name: "Vehículos" }],
            }}
            onElementClick={handleAgeClick}
          />

          <Chart<DistributionItem, DistributionParams>
            title="Vehículos por Marca"
            subtitle="Click para ver vehículos de la marca"
            footer={<span>Distribución por marca</span>}
            type="bar"
            fetchData={fetchBrands}
            filters={brandFilters}
            config={{
              xAxisKey: "name",
              series: [{ dataKey: "count", name: "Vehículos" }],
              xAxisLabelRotation: -45,
            }}
            onElementClick={handleBrandClick}
          />

          <Chart<DistributionItem, DistributionParams>
            title="Vehículos por Combustible"
            subtitle="Click para filtrar por tipo"
            footer={<span>Distribución por tipo</span>}
            type="pie"
            fetchData={fetchFuelTypes}
            filters={fuelTypeFilters}
            config={{
              nameKey: "name",
              dataKey: "count",
              outerRadius: 90,
              showLabels: true,
            }}
            onElementClick={handleFuelTypeClick}
          />
        </div>
      </section>

      <section className="metrics-section">
        <h2 className="section-title">Reservas y Mantenimientos</h2>
        <div className="charts-grid">
          <Chart<TimelineItem, TimelineParams>
            title="Reservas por Mes"
            fullWidth
            footer={(meta) => (
              <span>
                <b>{meta.total as number}</b> reservas en el período
              </span>
            )}
            type="line"
            fetchData={fetchReservations}
            filters={timelineFilters}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Reservas" }],
              strokeWidth: 3,
              showDots: true,
            }}
            onElementClick={handleReservationsClick}
          />

          <Chart<TimelineItem, TimelineParams>
            title="Registros de Mantenimiento"
            fullWidth
            footer={(meta) => (
              <span>
                <b>{meta.total as number}</b> mantenimientos en el período
              </span>
            )}
            type="area"
            fetchData={fetchMaintenance}
            filters={timelineFilters}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Mantenimientos" }],
              fillOpacity: 0.4,
            }}
          />
        </div>
      </section>

      <section className="metrics-section">
        <h2 className="section-title">Controles Trimestrales</h2>
        <div className="charts-grid">
          <Chart<QuarterlyControlMetric, QuarterlyParams>
            title="Estado de Controles por Trimestre"
            fullWidth
            footer={<span>Estado por trimestre</span>}
            type="bar"
            fetchData={fetchQuarterlyControls}
            filters={quarterlyFilters}
            config={{
              xAxisKey: "label",
              series: [
                {
                  dataKey: "aprobados",
                  name: "Aprobados",
                  color: COLORS.success,
                },
                {
                  dataKey: "pendientes",
                  name: "Pendientes",
                  color: COLORS.warning,
                },
                {
                  dataKey: "rechazados",
                  name: "Rechazados",
                  color: COLORS.error,
                },
                {
                  dataKey: "vencidos",
                  name: "Vencidos",
                  color: COLORS.default,
                },
              ],
              showLegend: true,
            }}
          />
        </div>
      </section>

      <section className="metrics-section">
        <h2 className="section-title">Personal Asignado</h2>
        <div className="charts-grid charts-grid--2-cols">
          <Chart<TimelineItem, TimelineParams>
            title="Conductores Asignados"
            footer={(meta) => (
              <span>
                <b>{meta.total as number}</b> conductores activos
              </span>
            )}
            type="line"
            fetchData={fetchDrivers}
            filters={timelineFilters}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Asignaciones" }],
              strokeWidth: 2,
              showDots: true,
            }}
          />

          <Chart<TimelineItem, TimelineParams>
            title="Responsables de Vehículos"
            footer={(meta) => (
              <span>
                <b>{meta.total as number}</b> responsables activos
              </span>
            )}
            type="line"
            fetchData={fetchResponsibles}
            filters={timelineFilters}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Asignaciones" }],
              strokeWidth: 2,
              showDots: true,
            }}
          />
        </div>
      </section>
    </div>
  );
}
