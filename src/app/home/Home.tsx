import "./Home.css";
import BentoHome from "../../components/BentoHome/BentoHome";
import IconUserBlue from "../../assets/icons/user blue.svg";
import IconCarBlue from "../../assets/icons/car blue.svg";
import IconSettingsBlue from "../../assets/icons/security blue.svg";

export default function Home() {
  return (
    <section className="home">
      <div className="home-content">
        <div className="home-header">
          <h1>Bienvenido @User </h1>
        </div>
        <div className="bento-home-container">
          <BentoHome icon={IconUserBlue} text="Gestión de Usuarios" />
          <BentoHome icon={IconCarBlue} text="Gestión de Vehículos" />
          <BentoHome icon={IconSettingsBlue} text="Gestión de Permisos" />
        </div>
      </div>
    </section>
  );
}
