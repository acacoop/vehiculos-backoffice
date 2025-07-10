import { useState } from "react";
import { COLORS } from "../../common/colors";
import "./UserState.css";

type Props = {
  active: boolean;
  onToggle?: (newState: boolean) => void;
};

export default function UserState({ active = true, onToggle }: Props) {
  const [isActive, setIsActive] = useState(active);

  const handleToggle = () => {
    setIsActive((prev) => {
      const newState = !prev;
      if (onToggle) onToggle(newState);
      return newState;
    });
  };

  return (
    <div className="user-state-container">
      <div className="user-state-title">
        <h2 style={{ color: COLORS.primary }}>Estado del Usuario</h2>
      </div>
      <div className="user-state-bento">
        <span
          style={{
            fontWeight: 600,
            color: isActive ? COLORS.success : COLORS.error,
          }}
        >
          {isActive ? "Usuario activo" : "Usuario bloqueado"}
        </span>
        <button
          onClick={handleToggle}
          style={{
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1.2rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {isActive ? "Bloquear" : "Desbloquear"}
        </button>
      </div>
    </div>
  );
}
