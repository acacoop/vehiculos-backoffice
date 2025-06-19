import users from "../../data/user.json";
import reservas from "../../data/reservas.json";
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
  | "autosRadar"
  | "reservasLine"
  | "reservasArea"
  | "topUsuariosBar"
  | "custom";

interface MetricsPanelProps {
  type: MetricsPanelType;
}

export default function MetricsPanel({ type }: MetricsPanelProps) {
  // --- Datos base ---
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = users.filter((u) => u.role === "administrador").length;
  const userUsers = totalUsers - adminUsers;

  const reservasPorMes = (() => {
    const map: Record<string, number> = {};
    reservas.forEach((r) => {
      map[r.mes] = (map[r.mes] || 0) + 1;
    });
    return Object.entries(map).map(([mes, count]) => ({ mes, count }));
  })();

  const reservasPorUsuario = users
    .map((u) => ({
      name: u.name,
      reservas: u.reservas ? u.reservas.length : 0,
    }))
    .filter((u) => u.reservas > 0);

  if (type === "usuariosPie") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Usuarios activos (Pie)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Activos", value: activeUsers },
                  { name: "Inactivos", value: inactiveUsers },
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
            <b>
              {totalUsers > 0
                ? Math.round((activeUsers / totalUsers) * 100)
                : 0}
              %
            </b>{" "}
            de usuarios activos
          </div>
        </div>
      </div>
    );
  }

  if (type === "usuariosBar") {
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Usuarios por rol (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { name: "Administradores", value: adminUsers },
                { name: "Usuarios", value: userUsers },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FE9000">
                <Cell fill="#FE9000" />
                <Cell fill="#282D86" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "autosRadar") {
    // Radar de cantidad de autos por marca (ejemplo simple)
    const marcas = users.reduce((acc: Record<string, number>, u) => {
      if (u.car) acc[u.car] = (acc[u.car] || 0) + 1;
      return acc;
    }, {});
    const data = Object.entries(marcas).map(([marca, count]) => ({
      marca,
      cantidad: count,
    }));
    return (
      <div className="metrics-panel-container">
        <div className="metrics-panel">
          <h3>Autos por modelo (Radar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data.slice(0, 8)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="marca" />
              <PolarRadiusAxis />
              <Radar
                name="Autos"
                dataKey="cantidad"
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
            <LineChart data={reservasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
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
            <AreaChart data={reservasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
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
              data={reservasPorUsuario
                .sort((a, b) => b.reservas - a.reservas)
                .slice(0, 5)}
              layout="vertical"
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="reservas" fill="#282D86">
                {reservasPorUsuario.map((_, index) => (
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
          <p>Aquí puedes mostrar cualquier métrica o gráfico que desees.</p>
        </div>
      </div>
    );
  }

  return null;
}
