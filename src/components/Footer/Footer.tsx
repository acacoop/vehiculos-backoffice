import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p> &copy; {year} . Todos los derechos reservados.</p>
        <p
          style={{
            color: "#FE9000",
          }}
        >
          Desarrollado por el equipo de TI
        </p>
      </div>
    </footer>
  );
}
