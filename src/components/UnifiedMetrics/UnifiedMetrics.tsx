import { useState, useEffect } from "react";
import { getDashboardMetrics } from "../../services/metrics";
import type { DashboardMetrics } from "../../services/metrics";
import "./UnifiedMetrics.css";
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

type UnifiedMetricsType =
  | "dashboard"
  | "usuariosPie"
  | "usuariosBar"
  | "vehiclesRadar"
  | "reservasLine"
  | "reservasArea"
  | "topUsuariosBar"
  | "custom";

interface UnifiedMetricsProps {
  type: UnifiedMetricsType;
  width?: string | number;
  height?: string | number;
  // optional callback when the metrics for this component have finished loading (success or error)
  onLoad?: () => void;
}

export default function UnifiedMetrics({
  type,
  width,
  height,
  onLoad,
}: UnifiedMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const containerStyle: React.CSSProperties = {};
  if (width) containerStyle.width = width;
  if (height) containerStyle.height = height;

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardMetrics();

        if (response.success) {
          setMetrics(response.data);
        }
      } finally {
        setLoading(false);
        // notify parent that this block finished loading
        try {
          onLoad && onLoad();
        } catch {}
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Cargando métricas...</h3>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Error al cargar métricas</h3>
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-row">
          <div className="unified-metrics-card">
            <h3 className="unified-metrics-title">Usuarios activos</h3>
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
                  <Cell key="activos" fill="#282D86" />
                  <Cell key="inactivos" fill="#bdbdbd" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="unified-metrics-footer">
              <b>{metrics.users.activePercentage}%</b> de usuarios activos
            </div>
          </div>
          <div className="unified-metrics-card">
            <h3 className="unified-metrics-title">Vehículos por marca</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart
                data={metrics.vehicles.byBrand.map((item) => ({
                  brand: item.brand,
                  count: item.count,
                }))}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="brand" />
                <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />
                <Radar
                  name="Vehículos"
                  dataKey="count"
                  stroke="#282D86"
                  fill="#282D86"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
            <div className="unified-metrics-footer">
              <b>{metrics.vehicles.total}</b> vehículos registrados
            </div>
          </div>
        </div>

        <div className="unified-metrics-card wide">
          <h3 className="unified-metrics-title">Reservas por mes</h3>
          {metrics.reservations.byMonth.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              No hay datos de reservas por mes
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.reservations.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis allowDecimals={false} stroke="#888" />
                <Tooltip />
                <Bar dataKey="count" fill="#FE9000">
                  {metrics.reservations.byMonth.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="unified-metrics-footer">
            <b>{metrics.reservations.total}</b> reservas totales
          </div>
        </div>

        <div className="unified-metrics-card wide">
          <h3 className="unified-metrics-title">
            Top usuarios con más reservas
          </h3>
          {metrics.reservations.byUser.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              No hay datos de usuarios con reservas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={metrics.reservations.byUser.slice(0, 5)}
                layout="vertical"
              >
                <XAxis type="number" allowDecimals={false} stroke="#888" />
                <YAxis
                  dataKey="userName"
                  type="category"
                  width={120}
                  stroke="#888"
                />
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
          )}
          <div className="unified-metrics-footer">
            Usuarios con reservas: {metrics.reservations.byUser.length}
          </div>
        </div>
      </div>
    );
  }

  if (type === "usuariosPie") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Usuarios activos (Pie)</h3>
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
                <Cell key="activos" fill="#282D86" />
                <Cell key="inactivos" fill="#bdbdbd" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            <b>{metrics.users.activePercentage}%</b> de usuarios activos
          </div>
        </div>
      </div>
    );
  }

  if (type === "usuariosBar") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Usuarios (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { status: "Activos", count: metrics.users.active },
                { status: "Inactivos", count: metrics.users.inactive },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="status" stroke="#888" />
              <YAxis allowDecimals={false} stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#282D86">
                <Cell key="activos" fill="#282D86" />
                <Cell key="inactivos" fill="#bdbdbd" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            Total: <b>{metrics.users.total}</b> usuarios
          </div>
        </div>
      </div>
    );
  }

  if (type === "vehiclesRadar") {
    const vehicleData = metrics.vehicles.byBrand.map((item) => ({
      brand: item.brand,
      count: item.count,
      fullMark: Math.max(...metrics.vehicles.byBrand.map((v) => v.count)),
    }));

    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Vehículos por marca (Radar)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={vehicleData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="brand" />
              <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />
              <Radar
                name="Vehículos"
                dataKey="count"
                stroke="#282D86"
                fill="#282D86"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            <b>{metrics.vehicles.total}</b> vehículos totales
          </div>
        </div>
      </div>
    );
  }

  if (type === "reservasLine") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card wide">
          <h3 className="unified-metrics-title">Reservas por mes (Línea)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics.reservations.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis allowDecimals={false} stroke="#888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FE9000"
                strokeWidth={3}
                dot={{ fill: "#282D86", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            <b>{metrics.reservations.total}</b> reservas totales
          </div>
        </div>
      </div>
    );
  }

  if (type === "reservasArea") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card wide">
          <h3 className="unified-metrics-title">Reservas por mes (Área)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.reservations.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis allowDecimals={false} stroke="#888" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#282D86"
                fill="#282D86"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            <b>{metrics.reservations.total}</b> reservas totales
          </div>
        </div>
      </div>
    );
  }

  if (type === "topUsuariosBar") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card wide">
          <h3 className="unified-metrics-title">
            Top usuarios (Bar horizontal)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={metrics.reservations.byUser.slice(0, 5)}
              layout="vertical"
            >
              <XAxis type="number" allowDecimals={false} stroke="#888" />
              <YAxis
                dataKey="userName"
                type="category"
                width={120}
                stroke="#888"
              />
              <Tooltip />
              <Bar dataKey="count" fill="#FE9000">
                {metrics.reservations.byUser.slice(0, 5).map((_, index) => (
                  <Cell
                    key={`cell-user-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="unified-metrics-footer">
            Top 5 usuarios con más reservas
          </div>
        </div>
      </div>
    );
  }

  if (type === "custom") {
    return (
      <div className="unified-metrics-container" style={containerStyle}>
        <div className="unified-metrics-card">
          <h3 className="unified-metrics-title">Métricas personalizadas</h3>
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
            <p>Aquí puedes agregar métricas personalizadas</p>
            <div style={{ marginTop: "20px", fontSize: "2rem" }}>📊</div>
          </div>
          <div className="unified-metrics-footer">Panel personalizable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-metrics-container" style={containerStyle}>
      <div className="unified-metrics-card">
        <h3 className="unified-metrics-title">Tipo de métrica no reconocido</h3>
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          El tipo "{type}" no está implementado
        </div>
      </div>
    </div>
  );
}
