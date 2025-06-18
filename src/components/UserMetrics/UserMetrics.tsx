import users from "../../data/user.json";
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
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = users.filter((u) => u.role === "administrador").length;
  const userUsers = totalUsers - adminUsers;

  const porcentajeActivos =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const porcentajeAdmins =
    totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;

  return (
    <div className="dashboard-metrics-row">
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
    </div>
  );
}
