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
};

export default function SidebarSection({ title, items, onNavigate }: Props) {
  const location = useLocation();

  const isActive = (to: string) => {
    return location.pathname === to;
  };

  return (
    <div className="sidebar-section-container">
      <div className="sidebar-section-title">{title}</div>
      <div className="sidebar-section-bar" aria-hidden />
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
  );
}
