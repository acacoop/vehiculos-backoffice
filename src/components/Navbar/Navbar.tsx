import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/brand/logo_blanco.webp";
import IconNavbar from "../../assets/icons/navbar.svg";
import IconLogout from "../../assets/icons/logout.svg";
import IconDashboard from "../../assets/icons/dashboard.svg";
import IconCar from "../../assets/icons/car.svg";
import IconUser from "../../assets/icons/user.svg";
import IconPermissions from "../../assets/icons/security.svg";
import IconMaintenance from "../../assets/icons/maintenance.svg";
import IconBrand from "../../assets/icons/vehicle_brand.svg";
import IconAssignment from "../../assets/icons/assignment.svg";
import { isAuthenticated, appLogout } from "../../common/auth";
import { getMe } from "../../services/users";
import type { User } from "../../types/user";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import Sidebar, { type SidebarSectionData } from "./Sidebar";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  const [askLogout, setAskLogout] = useState(false);

  const sidebarSections: SidebarSectionData[] = [
    {
      title: "General",
      items: [
        { icon: IconDashboard, label: "Dashboard", to: "/home" },
        { icon: IconUser, label: "Usuarios", to: "/users" },
        { icon: IconCar, label: "Vehículos", to: "/vehicles" },
      ],
    },
    {
      title: "Vehículos",
      items: [
        {
          icon: IconAssignment,
          label: "Asignaciones",
          to: "/vehicles/assignments",
        },
        {
          icon: IconPermissions,
          label: "Responsables",
          to: "/vehicles/responsibles",
        },
        {
          icon: IconAssignment,
          label: "Reservas",
          to: "/reservations",
        },
      ],
    },
    {
      title: "Mantenimientos",
      items: [
        {
          icon: IconMaintenance,
          label: "Categorías",
          to: "/maintenance/categories",
        },
        {
          icon: IconMaintenance,
          label: "Mantenimientos",
          to: "/maintenance/items",
        },
        {
          icon: IconPermissions,
          label: "Asignaciones",
          to: "/maintenance/assignments",
        },
        {
          icon: IconMaintenance,
          label: "Registros",
          to: "/maintenance/records",
        },
      ],
    },
    {
      title: "Catálogos",
      items: [
        { icon: IconBrand, label: "Marcas", to: "/vehicles/brands" },
        { icon: IconCar, label: "Modelos", to: "/vehicles/models" },
      ],
    },
  ];

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
      </nav>

      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        onLogout={() => setAskLogout(false)}
        sections={sidebarSections}
      />
    </>
  );
}

export default Navbar;
