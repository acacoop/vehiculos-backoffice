import { useState } from "react";
import { COLORS } from "../../common/colors";
import { updateUserStatus } from "../../services/users";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useUserContext } from "../../contexts/UserContext";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./UserState.css";

type Props = {
  userId: string;
  active: boolean;
  onToggle?: (newState: boolean) => void;
};

export default function UserState({ userId, active = true, onToggle }: Props) {
  const [isActive, setIsActive] = useState(active);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUserInList } = useUserContext();
  const { isOpen, message, showConfirm, handleConfirm, handleCancel } =
    useConfirmDialog();

  const handleToggle = () => {
    const newState = !isActive;
    const action = newState ? "desbloquear" : "bloquear";
    const message = `¿Estás seguro de que quieres ${action} este usuario?`;

    showConfirm(message, () => updateUserStatusInDB(newState));
  };

  const updateUserStatusInDB = async (newState: boolean) => {
    console.log(`🔄 Updating user ${userId} to active: ${newState}`);
    setIsLoading(true);
    try {
      const updatedUser = await updateUserStatus(userId, newState);
      console.log("✅ User updated in backend:", updatedUser);

      setIsActive(newState);

      // Actualizar en el context global
      updateUserInList(userId, { active: newState });
      console.log("✅ User updated in context");

      if (onToggle) onToggle(newState);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      alert("Error al actualizar el estado del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            disabled={isLoading}
            style={{
              background: isLoading ? "#ccc" : COLORS.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.2rem",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              if (!isLoading)
                (e.currentTarget as HTMLButtonElement).style.background =
                  COLORS.secondary;
            }}
            onMouseOut={(e) => {
              if (!isLoading)
                (e.currentTarget as HTMLButtonElement).style.background =
                  COLORS.primary;
            }}
          >
            {isLoading
              ? "Procesando..."
              : isActive
              ? "Bloquear"
              : "Desbloquear"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Cambiar estado del usuario"
      />
    </>
  );
}
