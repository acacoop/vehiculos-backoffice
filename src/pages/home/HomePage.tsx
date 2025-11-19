import { useEffect, useState } from "react";
import "./HomePage.css";
import BentoButton from "../../components/BentoButton/BentoButton";
import { Users, Car, ClipboardList, Gauge } from "lucide-react";
import IconArgentina from "../../assets/icons/escudo-de-la-rep-argentina.svg";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";
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
    <div className="home-content">
      <div className="home-header">
        <h1>Bienvenido/a {displayName || "Usuario"} </h1>
      </div>
      <LoadingSpinner visible={loading} message="Cargando información..." />
      <div className="bento-home-container">
        <BentoButton
          icon={Users}
          text="Usuarios"
          onClick={() => navigate("/users")}
        />
        <BentoButton
          icon={Car}
          text="Vehículos"
          onClick={() => navigate("/vehicles")}
        />
        <BentoButton
          icon={ClipboardList}
          text="Asignaciones"
          onClick={() => navigate("/assignments")}
        />
        <BentoButton
          icon={Gauge}
          text="Métricas"
          onClick={() => navigate("/metrics")}
        />
        <BentoButton
          customIcon={IconArgentina}
          text="DNRPA"
          onClick={() =>
            window.open("https://www.dnrpa.gov.ar/portal_dnrpa/", "_blank")
          }
        />
      </div>
    </div>
  );
}
