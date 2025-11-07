import { useEffect, useState } from "react";
import "./HomePage.css";
import BentoHome from "../../components/BentoHome/BentoHome";
import IconUserBlue from "../../assets/icons/user_blue.svg";
import IconCarBlue from "../../assets/icons/car_blue.svg";
import IconSettingsBlue from "../../assets/icons/security_blue.svg";
import IconMaintenanceBlue from "../../assets/icons/maintenance_blue.svg";
import IconMetricsBlue from "../../assets/icons/metrics_blue.svg";
import IconArgentina from "../../assets/icons/escudo-de-la-rep-argentina.svg";
import IconBrandBlue from "../../assets/icons/vehicle_brand_blue.svg";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import IconResponsible from "../../assets/icons/assignment_blue.svg";
import { isAuthenticated } from "../../common/auth";
import { getMe } from "../../services/users";
import type { User } from "../../types/user";

export default function HomePage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated()) return;
      setLoading(true);
      try {
        const res = await getMe();
        if (!cancelled && res.success && res.data) {
          const user = res.data as User;
          const name =
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : "Usuario";
          setDisplayName(name);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="home">
      <div className="home-content">
        <div className="home-header">
          <h1>Bienvenido/a {displayName || "Usuario"} </h1>
        </div>
        <LoadingSpinner visible={loading} message="Cargando información..." />
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
          <BentoHome
            icon={IconResponsible}
            text="Responsable de Vehículo"
            onClick={() => navigate("/vehicle-responsibles")}
          />
          <BentoHome
            icon={IconBrandBlue}
            text="Marcas y Modelos"
            onClick={() => navigate("/models")}
          />

          <BentoHome
            icon={IconArgentina}
            text="DNRPA"
            onClick={() =>
              window.open("https://www.dnrpa.gov.ar/portal_dnrpa/", "_blank")
            }
          />
        </div>
      </div>
    </section>
  );
}
