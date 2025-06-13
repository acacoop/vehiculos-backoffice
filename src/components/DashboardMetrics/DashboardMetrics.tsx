import { useMemo } from "react";
import reservas from "../../data/reservas.json";
import users from "../../data/user.json";
import "./DashboardMetrics.css";

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
} from "recharts";

// Paleta institucional y grises
const COLORS = [
  "#282D86", // azul institucional
  "#FE9000", // naranja institucional
  "#888888", // gris medio
  "#bdbdbd", // gris claro
  "#616161", // gris oscuro
  "#a6a6a6", // gris suave
  "#cfd8dc", // gris muy claro
  "#424242", // gris fuerte
];

export default function DashboardMetrics() {
  // Métricas de usuarios
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = users.filter((u) => u.role === "administrador").length;
  const userUsers = totalUsers - adminUsers;

  // Métricas de reservas
  const totalReservas = reservas.length;
  const reservasPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    reservas.forEach((r) => {
      map[r.mes] = (map[r.mes] || 0) + 1;
    });
    return Object.entries(map).map(([mes, count]) => ({ mes, count }));
  }, []);

  // Porcentaje de usuarios activos
  const porcentajeActivos =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  // Porcentaje de administradores
  const porcentajeAdmins =
    totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;

  // Porcentaje de reservas por usuario
  const reservasPorUsuario = users
    .map((u) => ({
      name: u.name,
      reservas: u.reservas ? u.reservas.length : 0,
    }))
    .filter((u) => u.reservas > 0);

  return (
    <div className="dashboard-metrics-container">
      {/* Usuarios activos vs inactivos */}
      <div className="dashboard-metrics-card">
        <h3 className="dashboard-metrics-title">Usuarios activos</h3>
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
              <Cell key="activos" fill="#282D86" />
              <Cell key="inactivos" fill="#bdbdbd" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="dashboard-metrics-footer">
          <b>{porcentajeActivos}%</b> de usuarios activos
        </div>
      </div>

      {/* Usuarios por rol */}
      <div className="dashboard-metrics-card">
        <h3 className="dashboard-metrics-title">Usuarios por rol</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={[
                { name: "Administradores", value: adminUsers },
                { name: "Usuarios", value: userUsers },
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
              <Cell key="admin" fill="#FE9000" />
              <Cell key="user" fill="#282D86" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="dashboard-metrics-footer">
          <b>{porcentajeAdmins}%</b> administradores
        </div>
      </div>

      {/* Reservas por mes */}
      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">Reservas por mes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={reservasPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="mes" stroke="#888" />
            <YAxis allowDecimals={false} stroke="#888" />
            <Tooltip />
            <Bar dataKey="count" fill="#FE9000">
              {reservasPorMes.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="dashboard-metrics-footer">
          <b>{totalReservas}</b> reservas totales
        </div>
      </div>

      {/* Reservas por usuario (top 5) */}
      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">Top 5 usuarios con más reservas</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={reservasPorUsuario
              .sort((a, b) => b.reservas - a.reservas)
              .slice(0, 5)}
            layout="vertical"
          >
            <XAxis type="number" allowDecimals={false} stroke="#888" />
            <YAxis dataKey="name" type="category" width={120} stroke="#888" />
            <Tooltip />
            <Bar dataKey="reservas" fill="#282D86">
              {reservasPorUsuario.map((entry, index) => (
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
