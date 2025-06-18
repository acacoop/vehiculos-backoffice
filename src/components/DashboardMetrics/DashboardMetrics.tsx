import "./DashboardMetrics.css";
import UserMetrics from "../UserMetrics/UserMetrics";
import ReserveMetrics from "../ReserveMetrics/ReserveMetrics";

export default function DashboardMetrics() {
  return (
    <div className="dashboard-metrics-container">
      <UserMetrics />
      <ReserveMetrics />
    </div>
  );
}
