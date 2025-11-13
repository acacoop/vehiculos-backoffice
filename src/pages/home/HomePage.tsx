import { useEffect, useState } from "react";
import "./HomePage.css";
import BentoHome from "../../components/BentoHome/BentoHome";
import {
  Users,
  Car,
  ClipboardList,
  Wrench,
  Gauge,
  ShieldCheck,
  CalendarCheck,
  Tags,
  CarFront,
} from "lucide-react";
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
        <BentoHome
          icon={Users}
          text="Usuarios"
          onClick={() => navigate("/users")}
        />
        <BentoHome
          icon={Car}
          text="Vehículos"
          onClick={() => navigate("/vehicles")}
        />
        <BentoHome
          icon={ClipboardList}
          text="Asignaciones"
          onClick={() => navigate("/assignments")}
        />
        <BentoHome
          icon={Wrench}
          text="Mantenimientos"
          onClick={() => navigate("/maintenances")}
        />
        <BentoHome
          icon={Gauge}
          text="Métricas"
          onClick={() => navigate("/metrics")}
        />
        <BentoHome
          icon={ShieldCheck}
          text="Responsables"
          onClick={() => navigate("/vehicles/responsibles")}
        />
        <BentoHome
          icon={CalendarCheck}
          text="Reservas"
          onClick={() => navigate("/reservations")}
        />
        <BentoHome
          icon={Tags}
          text="Marcas"
          onClick={() => navigate("/vehicles/brands")}
        />
        <BentoHome
          icon={CarFront}
          text="Modelos"
          onClick={() => navigate("/vehicles/models")}
        />

        <BentoHome
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
