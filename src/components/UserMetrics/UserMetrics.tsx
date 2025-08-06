import { useState, useEffect } from "react";
import { getUserMetrics } from "../../services/metrics";
import "./UserMetrics.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function UserMetrics() {
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    activePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        setLoading(true);
        const response = await getUserMetrics();

        if (response.success) {
          setUserStats(response.data);
        }
      } catch (error) {
        console.error("Error al obtener métricas de usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-card">
          <h3 className="dashboard-metrics-title">
            Cargando métricas de usuarios...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-metrics-row">
      <div className="dashboard-metrics-card">
        <h3 className="dashboard-metrics-title">Usuarios activos</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={[
                { name: "Activos", value: userStats.active },
                { name: "Inactivos", value: userStats.inactive },
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
          <b>{userStats.activePercentage}%</b> de usuarios activos
        </div>
      </div>
      <div className="dashboard-metrics-card">
        <h3 className="dashboard-metrics-title">Total de usuarios</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={[
                { name: "Total", value: userStats.total },
                { name: "Activos", value: userStats.active },
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
              <Cell key="total" fill="#FE9000" />
              <Cell key="active" fill="#282D86" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="dashboard-metrics-footer">
          <b>{userStats.total}</b> usuarios en total
        </div>
      </div>
    </div>
  );
}
