import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/brand/logo_blanco.webp";
import { isAuthenticated, appLogout } from "../../common/auth";
import { getMe } from "../../services/users";
import type { User } from "../../types/user";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import Sidebar, { type SidebarSectionData } from "./Sidebar";
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  ShieldCheck,
  CalendarCheck,
  Gauge,
  Wrench,
  Tags,
  FileText,
  CarFront,
  User as UserIcon,
  ChartBar,
  Menu,
  LogOut,
} from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  const [askLogout, setAskLogout] = useState(false);

  const sidebarSections: SidebarSectionData[] = [
    {
      title: "General",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", to: "/home" },
        { icon: UserIcon, label: "Usuarios", to: "/users" },
        { icon: Car, label: "Vehículos", to: "/vehicles" },
      ],
    },
    {
      title: "Vehículos",
      items: [
        {
          icon: ClipboardList,
          label: "Asignaciones",
          to: "/vehicles/assignments",
        },
        {
          icon: ShieldCheck,
          label: "Responsables",
          to: "/vehicles/responsibles",
        },
        {
          icon: CalendarCheck,
          label: "Reservas",
          to: "/reservations",
        },
        {
          icon: Gauge,
          label: "Registros de Kilometraje",
          to: "/vehicles/kilometersLogs",
        },
      ],
    },
    {
      title: "Mantenimientos",
      items: [
        {
          icon: Tags,
          label: "Categorías",
          to: "/maintenance/categories",
        },
        {
          icon: Wrench,
          label: "Mantenimientos",
          to: "/maintenance/items",
        },
        {
          icon: ClipboardList,
          label: "Requerimientos",
          to: "/maintenance/requirements",
        },
        {
          icon: FileText,
          label: "Registros",
          to: "/maintenance/records",
        },
        {
          icon: ClipboardList,
          label: "Checklists",
          to: "/maintenance/checklists",
        },
      ],
    },
    {
      title: "Catálogos",
      items: [
        { icon: Tags, label: "Marcas", to: "/vehicles/brands" },
        { icon: CarFront, label: "Modelos", to: "/vehicles/models" },
      ],
    },
    {
      title: "Informes",
      items: [{ icon: ChartBar, label: "Métricas", to: "/metrics" }],
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
          <Menu className="navbar-menu-icon" size={30} />
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
                <LogOut size={24} color="white" />
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
