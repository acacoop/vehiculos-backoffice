import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logoIniciales from "../../assets/brand/aca_iniciales.png";
import logo from "../../assets/brand/logo_blanco.webp";
import IconDashboard from "../../assets/icons/dashboard.svg";
import IconCar from "../../assets/icons/car.svg";
import IconUser from "../../assets/icons/user.svg";
import IconPermissions from "../../assets/icons/security.svg";
import IconMaintenance from "../../assets/icons/maintenance.svg";
import IconNavbar from "../../assets/icons/navbar.svg";
import IconBrand from "../../assets/icons/vehicle_brand.svg";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

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
    <>
      <nav className="navbar">
        <button
          className="navbar-toggle"
          type="button"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(!open)}
        >
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
        <aside
          ref={sidebarRef}
          className={`navbar-sidebar${open ? " open" : ""}`}
        >
          <div className="navbar-sidebar-header">
            <div className="navbar-sidebar-logo">
              <img src={logoIniciales} alt="ACA Logo" />
            </div>
            <button
              type="button"
              className="navbar-sidebar-close"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <ul>
            <li>
              <Link to="/home" onClick={() => setOpen(false)}>
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
                <img
                  className="icon-navbar"
                  src={IconUser}
                  alt="Icono usuario"
                />
                Usuarios
              </Link>
            </li>
            <li>
              <Link to="/vehicles" onClick={() => setOpen(false)}>
                <img
                  className="icon-navbar"
                  src={IconCar}
                  alt="Icono vehículo"
                />
                Vehículos
              </Link>
            </li>
            <li className="navbar-separator" role="separator">
              <span />
            </li>
            <li>
              <Link to="/maintenance/categories" onClick={() => setOpen(false)}>
                <img
                  className="icon-navbar"
                  src={IconMaintenance}
                  alt="Icono categorías"
                />
                Categorías
              </Link>
            </li>
            <li>
              <Link to="/maintenance/items" onClick={() => setOpen(false)}>
                <img
                  className="icon-navbar"
                  src={IconMaintenance}
                  alt="Icono mantenimientos"
                />
                Mantenimientos
              </Link>
            </li>
            <li>
              <Link
                to="/maintenance/assignments"
                onClick={() => setOpen(false)}
              >
                <img
                  className="icon-navbar"
                  src={IconPermissions}
                  alt="Icono asignaciones"
                />
                Asignaciones
              </Link>
            </li>
            <li className="navbar-separator" role="separator">
              <span />
            </li>
            <li>
              <Link to="/vehicles/brands" onClick={() => setOpen(false)}>
                <img
                  className="icon-navbar"
                  src={IconBrand}
                  alt="Icono marcas"
                />
                Marcas
              </Link>
            </li>
            <li>
              <Link to="/vehicles/models" onClick={() => setOpen(false)}>
                <img
                  className="icon-navbar"
                  src={IconCar}
                  alt="Icono modelos"
                />
                Modelos
              </Link>
            </li>

            {isMobile && isAuthenticated() && (
              <>
                <li className="navbar-sidebar-logout">
                  <button
                    className="navbar-sidebar-logout-btn"
                    onClick={() => {
                      setOpen(false);
                      setAskLogout(true);
                    }}
                  >
                    <img
                      className="icon-navbar"
                      src={IconLogout}
                      alt="Cerrar sesión"
                    />
                    Cerrar sesión
                  </button>
                </li>
                <li className="navbar-separator" role="separator">
                  <span />
                </li>
              </>
            )}
          </ul>
        </aside>
      </nav>
      {open && (
        <div
          className="navbar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Navbar;
