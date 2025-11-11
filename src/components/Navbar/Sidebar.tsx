import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIniciales from "../../assets/brand/aca_iniciales.png";
import IconLogout from "../../assets/icons/logout.svg";
import { isAuthenticated, appLogout } from "../../common/auth";
import SidebarSection, { type NavItem } from "./SidebarSection";
import "./Sidebar.css";

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
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
              />
            ))}
          </div>
          {isMobile && isAuthenticated() && (
            <div className="sidebar-logout">
              <button
                className="sidebar-logout-btn"
                onClick={handleLogoutClick}
              >
                <img
                  className="icon-sidebar"
                  src={IconLogout}
                  alt="Cerrar sesión"
                />
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
