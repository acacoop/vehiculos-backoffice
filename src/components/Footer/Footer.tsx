import { Link } from "react-router-dom";
import "./Footer.css";
import LogoBlanco from "../../assets/brand/logo_blanco.webp";
import { Phone, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const soporte = "https://acacoop.atlassian.net/servicedesk/customer/portals";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <img src={LogoBlanco} alt="ACA Logo" className="footer-logo" />
          <p className="footer-tagline">
            Sistema de Gestión Operativa de Flota Vehicular
          </p>
        </div>

        <div className="footer-section footer-contact">
          <h4 className="footer-title">Contacto</h4>
          <div className="footer-contact-item">
            <MapPin size={16} />
            <span>Av. Eduardo Madero 942, 7º Piso, CABA</span>
          </div>
          <div className="footer-contact-item">
            <Phone size={16} />
            <span>+54 11 4310-1300</span>
          </div>
        </div>

        <div className="footer-section footer-links">
          <h4 className="footer-title">Enlaces</h4>
          <Link to="/home">Inicio</Link>
          <Link to="/privacy-policy">Políticas de privacidad</Link>
          <Link to={soporte}>Soporte</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {year} Asociación de Cooperativas Argentinas. Todos los
          derechos reservados.
        </p>
        <p className="footer-credit">Desarrollado por el equipo de TI</p>
      </div>
    </footer>
  );
}
