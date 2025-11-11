import "./LoginPage.css";
import Logo from "../../assets/brand/logo_azul.webp";
import Microsoft from "../../assets/icons/microsoft.svg";
import { login, isAuthenticated, ensureActiveAccount } from "../../common/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Verificar si hay una cuenta activa válida
      const account = await ensureActiveAccount();
      if (account && isAuthenticated()) {
        navigate("/home", { replace: true });
      }
      setCheckingAuth(false);
    };

    void checkAuthentication();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      // Solo navegar si el login fue exitoso
      if (isAuthenticated()) {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth || isLoading) {
    return (
      <LoadingSpinner
        message={checkingAuth ? "Verificando sesión..." : "Iniciando sesión..."}
      />
    );
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
            href="https://acacoop.atlassian.net/servicedesk/customer/portals"
            target="_blank"
          >
            Contactate con soporte
          </a>
        </p>
      </div>
    </div>
  );
}
