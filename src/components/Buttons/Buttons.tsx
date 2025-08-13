import React from "react";
import "./Buttons.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

// Botón de cancelar (color amarillo empresarial)
export const CancelButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-cancel ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Cancelando..." : text}
    </button>
  );
};

// Botón de eliminar (color rojo)
export const DeleteButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-delete ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Eliminando..." : text}
    </button>
  );
};

// Botón de confirmar (color azul empresarial)
export const ConfirmButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-confirm ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Procesando..." : text}
    </button>
  );
};

// Componente para agrupar botones con espaciado consistente
interface ButtonGroupProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  align = "center",
  className = "",
}) => {
  return (
    <div className={`button-group button-group--${align} ${className}`}>
      {children}
    </div>
  );
};
