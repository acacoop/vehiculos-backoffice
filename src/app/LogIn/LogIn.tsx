import "./LogIn.css";
import Logo from "../../assets/brand/Logo azul.svg";
import Microsoft from "../../assets/icons/microsoft.png";

export default function LogIn() {
  return (
    <div className="login-container">
      <div className="login-form">
        <img className="logo" src={Logo} alt="Logo" />
        <button className="login-button">
          <img className="microsoft-icon" src={Microsoft} alt="" />
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
