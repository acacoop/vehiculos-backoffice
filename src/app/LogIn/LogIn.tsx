import "./LogIn.css";
import Logo from "../../assets/brand/Logo azul.svg";
import Microsoft from "../../assets/icons/microsoft.png";
import { login, isAuthenticated } from "../../common/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components";

export default function LogIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Iniciando sesión..." />;
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <img className="logo" src={Logo} alt="Logo" />
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          <img className="microsoft-icon" src={Microsoft} alt="" />
          Iniciar sesión
        </button>
        <p>
          ¿Algo salió mal?{" "}
          <a
            href="https://acacoop.atlassian.net/jira/servicedesk"
            target="_blank"
          >
            Contactate con soporte
          </a>
        </p>
      </div>
    </div>
  );
}
