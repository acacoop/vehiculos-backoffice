import "./Home.css";
import BentoHome from "../../components/BentoHome/BentoHome";
import IconUserBlue from "../../assets/icons/user blue.svg";
import IconCarBlue from "../../assets/icons/car blue.svg";
import IconSettingsBlue from "../../assets/icons/security blue.svg";
import IconMaintenanceBlue from "../../assets/icons/maintenance blue.svg";
import IconMetricsBlue from "../../assets/icons/metrics blue.svg";
import DashboardMetrics from "../../components/DashboardMetrics/DashboardMetrics";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="home">
      <div className="home-content">
        <div className="home-header">
          <h1>Bienvenido @User </h1>
        </div>
        <div className="bento-home-container">
          <BentoHome
            icon={IconUserBlue}
            text="Gestión de Usuarios"
            onClick={() => navigate("/users")}
          />
          <BentoHome
            icon={IconCarBlue}
            text="Gestión de Vehículos"
            onClick={() => navigate("/vehicles")}
          />
          <BentoHome
            icon={IconSettingsBlue}
            text="Gestión de Asignaciones"
            onClick={() => navigate("/assignments")}
          />
          <BentoHome
            icon={IconMaintenanceBlue}
            text="Gestión de Mantenimientos"
            onClick={() => navigate("/maintenances")}
          />
          <BentoHome
            icon={IconMetricsBlue}
            text="Métricas"
            onClick={() => navigate("/metrics")}
          />
        </div>
        <div>
          <DashboardMetrics />
        </div>
      </div>
    </section>
  );
}
