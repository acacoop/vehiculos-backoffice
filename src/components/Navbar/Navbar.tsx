import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/brand/Logo.png";
import IconDashboard from "../../assets/icons/dashboard.svg";
import IconCar from "../../assets/icons/car.svg";
import IconUser from "../../assets/icons/user.svg";
import IconMetrics from "../../assets/icons/metrics.svg";
import IconPermissions from "../../assets/icons/security.svg";
import IconMaintenance from "../../assets/icons/maintenance.svg";
import IconResponsible from "../../assets/icons/assignment.svg";
import IconNavbar from "../../assets/icons/navbar.svg";
import IconBrand from "../../assets/icons/vehicle brand.svg";
import { isAuthenticated, appLogout } from "../../common/auth";
import { getMe } from "../../services/users";
import type { User } from "../../types/user";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import IconLogout from "../../assets/icons/logout.svg";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  const [askLogout, setAskLogout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated()) return;
      const res = await getMe();
      if (!cancelled && res.success && res.data) {
        const user = res.data as User;
        const name =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Usuario";
        setDisplayName(name);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav className="navbar">
      <button className="navbar-toggle" onClick={() => setOpen(!open)}>
        <img className="navbar-menu-icon" src={IconNavbar} alt="Menu" />
      </button>
      <div className="navbar-logo">
        <img src={logo} alt="ACA Logo" />
      </div>
      <div className="navbar-user">
        {isAuthenticated() && (
          <>
            <span className="navbar-username">{displayName || ""}</span>
            <button
              className="logout-icon"
              title="Cerrar sesión"
              onClick={() => setAskLogout(true)}
            >
              <img className="icon-navbar" src={IconLogout} alt="Salir" />
            </button>
            <ConfirmDialog
              open={askLogout}
              title="Cerrar sesión"
              message="¿Querés cerrar la sesión de la aplicación?"
              confirmText="Cerrar sesión"
              cancelText="Cancelar"
              onConfirm={async () => {
                setAskLogout(false);
                await appLogout();
                navigate("/login", { replace: true });
              }}
              onCancel={() => setAskLogout(false)}
            />
          </>
        )}
      </div>
      <aside className={`navbar-sidebar${open ? " open" : ""}`}>
        <ul>
          <li>
            <Link to="/" onClick={() => setOpen(false)}>
              <img
                className="icon-navbar"
                src={IconDashboard}
                alt="Icono tablero"
              />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/users" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconUser} alt="Icono usuario" />
              Gestión de usuarios
            </Link>
          </li>
          <li>
            <Link to="/vehicles" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconCar} alt="Icono Vehículo" />{" "}
              Gestión de vehículos
            </Link>
          </li>
          <li>
            <Link to="/metrics" onClick={() => setOpen(false)}>
              <img
                className="icon-navbar"
                src={IconMetrics}
                alt="Icono Metricas"
              />{" "}
              Métricas
            </Link>
          </li>
          <li>
            <Link to="/assignments" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconPermissions} alt="" />{" "}
              Asignaciones
            </Link>
          </li>
          <li>
            <Link to="/maintenances" onClick={() => setOpen(false)}>
              <img
                className="icon-navbar"
                src={IconMaintenance}
                alt="Icono Mantenimiento"
              />{" "}
              Mantenimientos
            </Link>
          </li>
          <li>
            <Link to="/vehicle-responsibles" onClick={() => setOpen(false)}>
              <img
                className="icon-navbar"
                src={IconResponsible}
                alt="Icono Responsable"
              />{" "}
              Responsable de vehículo
            </Link>
          </li>
          <li>
            <Link to="/models" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconBrand} alt="Icono Marca" />{" "}
              Modelos y Marcas
            </Link>
          </li>
        </ul>
      </aside>
    </nav>
  );
}

export default Navbar;
