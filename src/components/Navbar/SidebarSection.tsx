import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export type NavItem = {
  icon: string;
  label: string;
  to: string;
};

type Props = {
  title: string;
  items: NavItem[];
  onNavigate?: () => void;
  defaultExpanded?: boolean;
};

export default function SidebarSection({
  title,
  items,
  onNavigate,
  defaultExpanded = false,
}: Props) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Sincronizar con defaultExpanded cuando cambia (ej: navegación)
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const isActive = (to: string) => {
    return location.pathname === to;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="sidebar-section-container">
      <button
        className="sidebar-section-header"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="sidebar-section-title">{title}</div>
        <span
          className={`sidebar-section-arrow ${isExpanded ? "expanded" : ""}`}
        >
          ▼
        </span>
      </button>
      <div className="sidebar-section-bar" aria-hidden />
      <div className={`section-items-wrapper ${isExpanded ? "expanded" : ""}`}>
        <div className="section-items">
          {items.map((it) => (
            <div
              key={it.to}
              className={`nav-item ${isActive(it.to) ? "active" : ""}`}
            >
              <Link to={it.to} onClick={onNavigate}>
                <img className="icon-sidebar" src={it.icon} alt={it.label} />
                {it.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
