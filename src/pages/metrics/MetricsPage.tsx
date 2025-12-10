import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChartCard,
  GenericChart,
  type ChartClickEvent,
} from "../../components/Charts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import {
  getDashboardMetrics,
  type DashboardMetrics,
} from "../../services/metrics";
import "./MetricsPage.css";

export default function MetricsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardMetrics();
        if (response.success && response.data) {
          setMetrics(response.data);
        } else {
          setError(response.message || "Error al cargar métricas");
        }
      } catch {
        setError("Error inesperado al cargar métricas");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Handler genérico para navegación al hacer click en elementos del gráfico
  const handleChartClick =
    (basePath: string, paramKey: string) => (event: ChartClickEvent) => {
      const value = event.data[paramKey];
      if (value !== undefined) {
        // Ejemplo: navegar a /vehicles?km=20000 o /vehicles?brand=Toyota
        navigate(
          `${basePath}?${paramKey}=${encodeURIComponent(String(value))}`
        );
      }
    };

  if (loading) {
    return (
      <div className="metrics-container">
        <h1 className="title">Métricas</h1>
        <LoadingSpinner message="Cargando métricas..." visible={true} />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="metrics-container">
        <h1 className="title">Métricas</h1>
        <div className="metrics-error">
          {error || "No se pudieron cargar las métricas"}
        </div>
      </div>
    );
  }

  // Preparar datos para los gráficos
  const usersData = [
    { status: "Activos", value: metrics.users.active },
    { status: "Inactivos", value: metrics.users.inactive },
  ];

  const vehiclesByBrandData = metrics.vehicles.byBrand.map((item) => ({
    brand: item.brand,
    count: item.count,
  }));

  const reservationsByMonthData = metrics.reservations.byMonth.map((item) => ({
    month: item.month,
    count: item.count,
  }));

  const topUsersData = metrics.reservations.byUser.slice(0, 5).map((item) => ({
    userName: item.userName,
    count: item.count,
  }));

  return (
    <div className="metrics-container">
      <div className="header-metrics">
        <h1 className="title">Métricas</h1>
      </div>

      {/* Grid de gráficos pequeños */}
      <div className="charts-grid charts-grid--2-cols">
        {/* Gráfico de Pie - Usuarios activos */}
        <ChartCard
          title="Usuarios Activos"
          footer={
            <span>
              <b>{metrics.users.activePercentage}%</b> de usuarios activos
            </span>
          }
        >
          <GenericChart
            type="pie"
            data={usersData}
            config={{
              nameKey: "status",
              dataKey: "value",
              outerRadius: 70,
              showLabels: true,
            }}
            onElementClick={handleChartClick("/users", "status")}
          />
        </ChartCard>

        {/* Gráfico de Barras - Usuarios */}
        <ChartCard
          title="Usuarios por Estado"
          footer={
            <span>
              Total: <b>{metrics.users.total}</b> usuarios
            </span>
          }
        >
          <GenericChart
            type="bar"
            data={usersData}
            config={{
              xAxisKey: "status",
              series: [{ dataKey: "value", name: "Usuarios" }],
            }}
            onElementClick={handleChartClick("/users", "status")}
          />
        </ChartCard>

        {/* Gráfico Radar - Vehículos por marca */}
        <ChartCard
          title="Vehículos por Marca"
          footer={
            <span>
              <b>{metrics.vehicles.total}</b> vehículos totales
            </span>
          }
        >
          <GenericChart
            type="radar"
            data={vehiclesByBrandData}
            config={{
              angleKey: "brand",
              series: [{ dataKey: "count", name: "Vehículos" }],
            }}
            onElementClick={handleChartClick("/vehicles", "brand")}
          />
        </ChartCard>

        {/* Gráfico de Barras - Vehículos por marca (alternativo) */}
        <ChartCard
          title="Vehículos por Marca (Barras)"
          subtitle="Click en una barra para ver detalles"
          footer={
            <span>
              <b>{metrics.vehicles.total}</b> vehículos registrados
            </span>
          }
        >
          <GenericChart
            type="bar"
            data={vehiclesByBrandData}
            config={{
              xAxisKey: "brand",
              series: [{ dataKey: "count", name: "Cantidad" }],
            }}
            onElementClick={handleChartClick("/vehicles", "brand")}
          />
        </ChartCard>
      </div>
      {/* Gráficos de ancho completo */}
      <div className="charts-grid">
        {/* Gráfico de Línea - Reservas por mes */}
        <ChartCard
          title="Reservas por Mes"
          fullWidth
          footer={
            <span>
              <b>{metrics.reservations.total}</b> reservas totales
            </span>
          }
        >
          <GenericChart
            type="line"
            data={reservationsByMonthData}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Reservas" }],
              strokeWidth: 3,
              showDots: true,
            }}
            onElementClick={handleChartClick("/reservations", "month")}
          />
        </ChartCard>

        {/* Gráfico de Área - Reservas por mes */}
        <ChartCard
          title="Tendencia de Reservas"
          fullWidth
          footer={<span>Evolución mensual de reservas</span>}
        >
          <GenericChart
            type="area"
            data={reservationsByMonthData}
            config={{
              xAxisKey: "month",
              series: [{ dataKey: "count", name: "Reservas" }],
              fillOpacity: 0.4,
            }}
            onElementClick={handleChartClick("/reservations", "month")}
          />
        </ChartCard>

        {/* Gráfico de Barras Horizontal - Top usuarios */}
        <ChartCard
          title="Top Usuarios con Más Reservas"
          fullWidth
          footer={<span>Top 5 usuarios con más reservas</span>}
        >
          <GenericChart
            type="horizontalBar"
            data={topUsersData}
            config={{
              xAxisKey: "userName",
              series: [{ dataKey: "count", name: "Reservas" }],
              layout: "vertical",
            }}
            onElementClick={handleChartClick("/users", "userName")}
          />
        </ChartCard>
      </div>
    </div>
  );
}
