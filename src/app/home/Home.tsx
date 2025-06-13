import "./Home.css";
import BentoHome from "../../components/BentoHome/BentoHome";
import IconUserBlue from "../../assets/icons/user blue.svg";
import IconCarBlue from "../../assets/icons/car blue.svg";
import IconSettingsBlue from "../../assets/icons/security blue.svg";
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
            onClick={() => navigate("/user")}
          />
          <BentoHome icon={IconCarBlue} text="Gestión de Vehículos" />
          <BentoHome icon={IconSettingsBlue} text="Gestión de Permisos" />
        </div>
        <div>
          <DashboardMetrics />
        </div>
      </div>
    </section>
  );
}
