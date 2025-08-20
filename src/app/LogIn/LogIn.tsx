import "./LogIn.css";
import Logo from "../../assets/brand/Logo azul.svg";
import Microsoft from "../../assets/icons/microsoft.png";
import { login, isAuthenticated } from "../../common/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogIn() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <img className="logo" src={Logo} alt="Logo" />
        <button
          className="login-button"
          onClick={async () => {
            await login();
            navigate("/home", { replace: true });
          }}
        >
          <img className="microsoft-icon" src={Microsoft} alt="" />
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
