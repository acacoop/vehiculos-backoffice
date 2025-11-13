import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoIniciales from "../../assets/brand/aca_iniciales.png";
import { isAuthenticated, appLogout } from "../../common/auth";
import SidebarSection, { type NavItem } from "./SidebarSection";
import "./Sidebar.css";
import { LogOut } from "lucide-react";

export type SidebarSectionData = {
  title: string;
  items: NavItem[];
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  sections: SidebarSectionData[];
};

export default function Sidebar({
  open,
  onClose,
  onLogout,
  sections,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Determinar qué sección debe estar expandida por defecto
  const getSectionToExpand = () => {
    const currentPath = location.pathname;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const hasActiveItem = section.items.some(
        (item) => currentPath === item.to
      );
      if (hasActiveItem) {
        console.log("Expanding section:", section.title);
        return i;
      }
    }

    return 0; // Por defecto la primera sección
  };

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
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  const handleLogoutClick = async () => {
    onClose();
    await appLogout();
    navigate("/login", { replace: true });
    onLogout();
  };

  return (
    <>
      <aside ref={sidebarRef} className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logoIniciales} alt="ACA Logo" />
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-sections">
            {sections.map((section, index) => (
              <SidebarSection
                key={index}
                title={section.title}
                onNavigate={onClose}
                items={section.items}
                defaultExpanded={index === getSectionToExpand()}
              />
            ))}
          </div>
          {isMobile && isAuthenticated() && (
            <div className="sidebar-logout">
              <button
                className="sidebar-logout-btn"
                onClick={handleLogoutClick}
              >
                <LogOut size={20} style={{ marginRight: "8px" }} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
      {open && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
}
