import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/brand/Logo.png";
import IconDashboard from "../../assets/icons/dashboard.svg";
import IconCar from "../../assets/icons/car.svg";
import IconUser from "../../assets/icons/user.svg";
import IconMetrics from "../../assets/icons/metrics.svg";
import IconPermissions from "../../assets/icons/security.svg";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <button className="navbar-toggle" onClick={() => setOpen(!open)}>
        <span className="navbar-icon">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </span>
      </button>
      <div className="navbar-logo">
        <img src={logo} alt="ACA Logo" />
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
            <Link to="/user" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconUser} alt="Icono usuario" />
              Gestión de usuarios
            </Link>
          </li>
          <li>
            <Link to="/vehiculos" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconCar} alt="Icono Vehículo" />{" "}
              Gestión de vehículos
            </Link>
          </li>
          <li>
            <Link to="/metricas" onClick={() => setOpen(false)}>
              <img
                className="icon-navbar"
                src={IconMetrics}
                alt="Icono Metricas"
              />{" "}
              Métricas
            </Link>
          </li>
          <li>
            <Link to="/permisos" onClick={() => setOpen(false)}>
              <img className="icon-navbar" src={IconPermissions} alt="" />{" "}
              Permisos
            </Link>
          </li>
        </ul>
      </aside>
    </nav>
  );
}

export default Navbar;
