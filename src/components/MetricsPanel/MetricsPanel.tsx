import { useState, useEffect } from "react";
import { getDashboardMetrics } from "../../services/metrics";
import type { DashboardMetrics } from "../../services/metrics";
import "./MetricsPanel.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const COLORS = [
  "#282D86",
  "#FE9000",
  "#888888",
  "#bdbdbd",
  "#616161",
  "#a6a6a6",
  "#cfd8dc",
  "#424242",
];

type MetricsPanelType =
  | "usuariosPie"
  | "usuariosBar"
  | "vehiclesRadar"
  | "reservasLine"
  | "reservasArea"
  | "topUsuariosBar"
  | "custom";

interface MetricsPanelProps {
  type: MetricsPanelType;
}

export default function MetricsPanel({ type }: MetricsPanelProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardMetrics();

        if (response.success) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error("Error al obtener métricas del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Cargando métricas...</h3>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Error al cargar métricas</h3>
        </div>
      </div>
    );
  }

  if (type === "usuariosPie") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Usuarios activos (Pie)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Activos", value: metrics.users.active },
                  { name: "Inactivos", value: metrics.users.inactive },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                <Cell fill="#282D86" />
                <Cell fill="#bdbdbd" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="dashboard-metrics-footer">
            <b>{metrics.users.activePercentage}%</b> de usuarios activos
          </div>
        </div>
      </div>
    );
  }

  if (type === "usuariosBar") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Estado de usuarios (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { name: "Activos", value: metrics.users.active },
                { name: "Inactivos", value: metrics.users.inactive },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FE9000">
                <Cell fill="#282D86" />
                <Cell fill="#bdbdbd" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "vehiclesRadar") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Vehículos por marca (Radar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={metrics.vehicles.byBrand.slice(0, 8)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="brand" />
              <PolarRadiusAxis />
              <Radar
                name="Vehículos"
                dataKey="count"
                stroke="#282D86"
                fill="#282D86"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "reservasLine") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Reservas por mes (Line)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics.reservations.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FE9000"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "reservasArea") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Reservas por mes (Area)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.reservations.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#282D86"
                fill="#FE9000"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "topUsuariosBar") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Top usuarios con más reservas (Bar horizontal)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={metrics.reservations.byUser.slice(0, 5)}
              layout="vertical"
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="userName" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#282D86">
                {metrics.reservations.byUser.slice(0, 5).map((_, index) => (
                  <Cell
                    key={`cell-user-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Panel custom de ejemplo
  if (type === "custom") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Panel Personalizado</h3>
          <div className="custom-metrics">
            <p>
              <strong>Total de usuarios:</strong> {metrics.users.total}
            </p>
            <p>
              <strong>Total de reservas:</strong> {metrics.reservations.total}
            </p>
            <p>
              <strong>Total de vehículos:</strong> {metrics.vehicles.total}
            </p>
            <p>
              <strong>Total de asignaciones:</strong>{" "}
              {metrics.assignments.total}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
