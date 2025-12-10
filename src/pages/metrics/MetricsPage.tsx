import { useState, useEffect, useMemo } from "react";
import { ChartCard, GenericChart } from "../../components/Charts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import {
  getVehicleCount,
  getVehiclesByKilometers,
  getVehiclesByAge,
  getVehiclesByFuelType,
  getVehiclesByBrand,
  getReservationsTimeline,
  getMaintenanceRecordsTimeline,
  getQuarterlyControlsStatus,
  getDriversMetrics,
  getResponsiblesMetrics,
} from "../../services/metrics";
import { useMetricsNavigation } from "./useMetricsNavigation";
import {
  prepareBucketData,
  prepareDistributionData,
  prepareTimelineData,
  prepareQuarterlyControlsData,
  sumTimelineCount,
} from "./utils";
import { INITIAL_METRICS_STATE, type MetricsState } from "./types";
import "./MetricsPage.css";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsState>(INITIAL_METRICS_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    handleKilometersClick,
    handleAgeClick,
    handleBrandClick,
    handleFuelTypeClick,
    handleReservationsClick,
  } = useMetricsNavigation();

  useEffect(() => {
    const fetchAllMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          vehicleCount,
          vehiclesByKilometers,
          vehiclesByAge,
          vehiclesByFuelType,
          vehiclesByBrand,
          reservationsTimeline,
          maintenanceTimeline,
          quarterlyControls,
          driversMetrics,
          responsiblesMetrics,
        ] = await Promise.all([
          getVehicleCount(),
          getVehiclesByKilometers({ bucketSize: 20000, maxBuckets: 8 }),
          getVehiclesByAge({ bucketSize: 2, maxBuckets: 10 }),
          getVehiclesByFuelType(),
          getVehiclesByBrand(),
          getReservationsTimeline({ months: 12 }),
          getMaintenanceRecordsTimeline({ months: 12 }),
          getQuarterlyControlsStatus({ periods: 8 }),
          getDriversMetrics({ months: 12 }),
          getResponsiblesMetrics({ months: 12 }),
        ]);

        setMetrics({
          vehicleCount: vehicleCount.success ? vehicleCount.data : null,
          vehiclesByKilometers: vehiclesByKilometers.success
            ? vehiclesByKilometers.data
            : null,
          vehiclesByAge: vehiclesByAge.success ? vehiclesByAge.data : null,
          vehiclesByFuelType: vehiclesByFuelType.success
            ? vehiclesByFuelType.data
            : null,
          vehiclesByBrand: vehiclesByBrand.success
            ? vehiclesByBrand.data
            : null,
          reservationsTimeline: reservationsTimeline.success
            ? reservationsTimeline.data
            : null,
          maintenanceTimeline: maintenanceTimeline.success
            ? maintenanceTimeline.data
            : null,
          quarterlyControls: quarterlyControls.success
            ? quarterlyControls.data
            : null,
          driversMetrics: driversMetrics.success ? driversMetrics.data : null,
          responsiblesMetrics: responsiblesMetrics.success
            ? responsiblesMetrics.data
            : null,
        });
      } catch {
        setError("Error inesperado al cargar métricas");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMetrics();
  }, []);

  // Preparar datos para gráficos usando useMemo
  const chartData = useMemo(() => {
    const kilometersData = prepareBucketData(metrics.vehiclesByKilometers);
    const ageData = prepareBucketData(metrics.vehiclesByAge);
    const brandData = prepareDistributionData(metrics.vehiclesByBrand, 4);
    const fuelTypeData = prepareDistributionData(
      metrics.vehiclesByFuelType,
      10
    );
    const reservationsData = prepareTimelineData(metrics.reservationsTimeline);
    const maintenanceData = prepareTimelineData(metrics.maintenanceTimeline);
    const driversData = prepareTimelineData(metrics.driversMetrics);
    const responsiblesData = prepareTimelineData(metrics.responsiblesMetrics);
    const quarterlyControlsData = prepareQuarterlyControlsData(
      metrics.quarterlyControls
    );

    return {
      kilometersData,
      ageData,
      brandData,
      fuelTypeData,
      reservationsData,
      maintenanceData,
      driversData,
      responsiblesData,
      quarterlyControlsData,
      totalVehicles: metrics.vehicleCount?.total ?? 0,
      totalReservations: sumTimelineCount(reservationsData),
      totalMaintenance: sumTimelineCount(maintenanceData),
      totalDrivers: metrics.driversMetrics?.totalActual ?? 0,
      totalResponsibles: metrics.responsiblesMetrics?.totalActual ?? 0,
    };
  }, [metrics]);

  if (loading) {
    return (
      <div className="metrics-container">
        <h1 className="title">Métricas</h1>
        <LoadingSpinner message="Cargando métricas..." visible={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-container">
        <h1 className="title">Métricas</h1>
        <div className="metrics-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="metrics-container">
      <div className="header-metrics">
        <h1 className="title">Métricas</h1>
      </div>

      {/* Sección: Vehículos */}
      <section className="metrics-section">
        <h2 className="section-title">Vehículos</h2>
        <div className="charts-grid charts-grid--2-cols">
          <ChartCard
            title="Vehículos por Kilómetros"
            subtitle="Click en una barra para ver vehículos"
            footer={
              <span>
                <b>{chartData.totalVehicles}</b> vehículos totales
              </span>
            }
          >
            <GenericChart
              type="bar"
              data={chartData.kilometersData}
              config={{
                xAxisKey: "label",
                series: [{ dataKey: "count", name: "Vehículos" }],
              }}
              onElementClick={handleKilometersClick}
            />
          </ChartCard>

          <ChartCard
            title="Vehículos por Antigüedad"
            subtitle="Click en una barra para ver vehículos"
            footer={<span>Agrupados por años de antigüedad</span>}
          >
            <GenericChart
              type="bar"
              data={chartData.ageData}
              config={{
                xAxisKey: "label",
                series: [{ dataKey: "count", name: "Vehículos" }],
              }}
              onElementClick={handleAgeClick}
            />
          </ChartCard>

          <ChartCard
            title="Vehículos por Marca"
            subtitle="Click para ver vehículos de la marca"
            footer={<span>Top 4 + Otros</span>}
          >
            <GenericChart
              type="pie"
              data={chartData.brandData}
              config={{
                nameKey: "name",
                dataKey: "count",
                outerRadius: 70,
                showLabels: true,
              }}
              onElementClick={handleBrandClick}
            />
          </ChartCard>

          <ChartCard
            title="Vehículos por Combustible"
            subtitle="Click para filtrar por tipo"
            footer={<span>Distribución por tipo</span>}
          >
            <GenericChart
              type="pie"
              data={chartData.fuelTypeData}
              config={{
                nameKey: "name",
                dataKey: "count",
                outerRadius: 70,
                showLabels: true,
              }}
              onElementClick={handleFuelTypeClick}
            />
          </ChartCard>
        </div>
      </section>

      {/* Sección: Reservas y Mantenimientos */}
      <section className="metrics-section">
        <h2 className="section-title">Reservas y Mantenimientos</h2>
        <div className="charts-grid">
          <ChartCard
            title="Reservas por Mes"
            fullWidth
            footer={
              <span>
                <b>{chartData.totalReservations}</b> reservas en el período
              </span>
            }
          >
            <GenericChart
              type="line"
              data={chartData.reservationsData}
              config={{
                xAxisKey: "month",
                series: [{ dataKey: "count", name: "Reservas" }],
                strokeWidth: 3,
                showDots: true,
              }}
              onElementClick={handleReservationsClick}
            />
          </ChartCard>

          <ChartCard
            title="Mantenimientos por Mes"
            fullWidth
            footer={
              <span>
                <b>{chartData.totalMaintenance}</b> mantenimientos en el período
              </span>
            }
          >
            <GenericChart
              type="area"
              data={chartData.maintenanceData}
              config={{
                xAxisKey: "month",
                series: [{ dataKey: "count", name: "Mantenimientos" }],
                fillOpacity: 0.4,
              }}
            />
          </ChartCard>
        </div>
      </section>

      {/* Sección: Controles Trimestrales */}
      {chartData.quarterlyControlsData.length > 0 && (
        <section className="metrics-section">
          <h2 className="section-title">Controles Trimestrales</h2>
          <div className="charts-grid">
            <ChartCard
              title="Estado de Controles por Trimestre"
              fullWidth
              footer={<span>Últimos 8 trimestres</span>}
            >
              <GenericChart
                type="bar"
                data={chartData.quarterlyControlsData}
                config={{
                  xAxisKey: "label",
                  series: [
                    {
                      dataKey: "aprobados",
                      name: "Aprobados",
                      color: "#43A047",
                    },
                    {
                      dataKey: "pendientes",
                      name: "Pendientes",
                      color: "#FB8C00",
                    },
                    {
                      dataKey: "rechazados",
                      name: "Rechazados",
                      color: "#E53935",
                    },
                    { dataKey: "vencidos", name: "Vencidos", color: "#9E9E9E" },
                  ],
                  showLegend: true,
                }}
              />
            </ChartCard>
          </div>
        </section>
      )}

      {/* Sección: Personal */}
      <section className="metrics-section">
        <h2 className="section-title">Personal Asignado</h2>
        <div className="charts-grid charts-grid--2-cols">
          <ChartCard
            title="Conductores Asignados"
            footer={
              <span>
                <b>{chartData.totalDrivers}</b> conductores activos
              </span>
            }
          >
            <GenericChart
              type="line"
              data={chartData.driversData}
              config={{
                xAxisKey: "month",
                series: [{ dataKey: "count", name: "Asignaciones" }],
                strokeWidth: 2,
                showDots: true,
              }}
            />
          </ChartCard>

          <ChartCard
            title="Responsables de Vehículos"
            footer={
              <span>
                <b>{chartData.totalResponsibles}</b> responsables activos
              </span>
            }
          >
            <GenericChart
              type="line"
              data={chartData.responsiblesData}
              config={{
                xAxisKey: "month",
                series: [{ dataKey: "count", name: "Asignaciones" }],
                strokeWidth: 2,
                showDots: true,
              }}
            />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
