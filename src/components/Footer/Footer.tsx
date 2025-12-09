import "./Footer.css";
import { COLORS } from "../../common/colors";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p> &copy; {year} . Todos los derechos reservados.</p>
        <p
          style={{
            color: COLORS.secondary,
          }}
        >
          Desarrollado por el equipo de TI
        </p>
      </div>
    </footer>
  );
}
