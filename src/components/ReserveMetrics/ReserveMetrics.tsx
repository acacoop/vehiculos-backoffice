import { useMemo } from "react";
import reservas from "../../data/reservas.json";
import users from "../../data/user.json";
import "./ReserveMetrics.css";

import {
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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

export default function ReserveMetrics() {
  // Métricas de reservas
  const totalReservas = reservas.length;
  const reservasPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    reservas.forEach((r) => {
      map[r.mes] = (map[r.mes] || 0) + 1;
    });
    return Object.entries(map).map(([mes, count]) => ({ mes, count }));
  }, []);

  // Porcentaje de reservas por usuario
  const reservasPorUsuario = users
    .map((u) => ({
      name: u.name,
      reservas: u.reservas ? u.reservas.length : 0,
    }))
    .filter((u) => u.reservas > 0);

  return (
    <div className="dashboard-metrics-container">
      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">Reservas por mes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={reservasPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="mes" stroke="#888" />
            <YAxis allowDecimals={false} stroke="#888" />
            <Tooltip />
            <Bar dataKey="count" fill="#FE9000">
              {reservasPorMes.map((_, index) => (
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

      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">
          Top 5 usuarios con más reservas
        </h3>
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
              {reservasPorUsuario
                .sort((a, b) => b.reservas - a.reservas)
                .slice(0, 5)
                .map((_, index) => (
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
