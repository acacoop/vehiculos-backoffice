import { useState, useEffect } from "react";
import { getReservationMetrics } from "../../services/metrics";
import type { ReservationMetrics } from "../../services/metrics";
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
  const [metrics, setMetrics] = useState<ReservationMetrics>({
    total: 0,
    byMonth: [],
    byUser: [],
    byVehicle: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservationMetrics = async () => {
      try {
        setLoading(true);
        const response = await getReservationMetrics();

        if (response.success) {
          console.log("Reservation metrics data:", response.data);
          console.log("byUser data:", response.data.byUser);
          setMetrics(response.data);
        } else {
          console.error("Error response:", response.message);
        }
      } catch (error) {
        console.error("Error al obtener métricas de reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationMetrics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-metrics-container">
        <div className="dashboard-metrics-card wide">
          <h3 className="dashboard-metrics-title">
            Cargando métricas de reservas...
          </h3>
        </div>
      </div>
    );
  }

  // Mostrar datos para debugging
  console.log("Rendering ReserveMetrics with data:", metrics);

  return (
    <div className="dashboard-metrics-container">
      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">Reservas por mes</h3>
        {metrics.byMonth.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No hay datos de reservas por mes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis allowDecimals={false} stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#FE9000">
                {metrics.byMonth.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="dashboard-metrics-footer">
          <b>{metrics.total}</b> reservas totales
        </div>
      </div>

      <div className="dashboard-metrics-card wide">
        <h3 className="dashboard-metrics-title">
          Top usuarios con más reservas
        </h3>
        {metrics.byUser.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No hay datos de usuarios con reservas
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.byUser.slice(0, 5)} layout="vertical">
              <XAxis type="number" allowDecimals={false} stroke="#888" />
              <YAxis
                dataKey="userName"
                type="category"
                width={120}
                stroke="#888"
              />
              <Tooltip />
              <Bar dataKey="count" fill="#282D86">
                {metrics.byUser.slice(0, 5).map((_, index) => (
                  <Cell
                    key={`cell-user-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="dashboard-metrics-footer">
          Usuarios con reservas: {metrics.byUser.length}
        </div>
      </div>
    </div>
  );
}
