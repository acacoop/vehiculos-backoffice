import { useState } from "react";
import { COLORS } from "../../common/colors";
import { updateUserStatus } from "../../services/users";
import { useConfirmDialog, useNotification } from "../../hooks";
import "./StatusToggle.css";
import { DeleteButton, ConfirmButton } from "../Buttons/Buttons";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import NotificationToast from "../NotificationToast/NotificationToast";

type EntityType = "user" | "vehicle";

type Props = {
  entityId: string;
  entityType: EntityType;
  active?: boolean;
  onToggle?: (newState: boolean) => void;
};

const ENTITY_CONFIG = {
  user: {
    title: "Estado del Usuario",
    activeText: "Usuario activo",
    inactiveText: "Usuario bloqueado",
    activateAction: "desbloquear",
    deactivateAction: "bloquear",
    activateButton: "Desbloquear",
    deactivateButton: "Bloquear",
    dialogTitle: "Cambiar estado del usuario",
  },
  vehicle: {
    title: "Estado del Vehículo",
    activeText: "Vehículo activo",
    inactiveText: "Vehículo dado de baja",
    activateAction: "reactivar",
    deactivateAction: "dar de baja",
    activateButton: "Reactivar",
    deactivateButton: "Dar de baja",
    dialogTitle: "Cambiar estado del vehículo",
  },
};

export default function StatusToggle({
  entityId,
  entityType,
  active = true,
  onToggle,
}: Props) {
  const [isActive, setIsActive] = useState(active);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, message, showConfirm, handleConfirm, handleCancel } =
    useConfirmDialog();
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  const config = ENTITY_CONFIG[entityType];

  const handleToggle = () => {
    const newState = !isActive;
    const action = newState ? config.activateAction : config.deactivateAction;
    const confirmMessage = `¿Estás seguro de que quieres ${action} este ${
      entityType === "user" ? "usuario" : "vehículo"
    }?`;

    showConfirm(confirmMessage, () => updateEntityStatusInDB(newState));
  };

  const updateEntityStatusInDB = async (newState: boolean) => {
    setIsLoading(true);

    try {
      if (entityType === "user") {
        const response = await updateUserStatus(entityId, newState);

        if (response.success) {
          setIsActive(newState);
          if (onToggle) onToggle(newState);
          const successMessage = newState
            ? `Usuario desbloqueado exitosamente`
            : `Usuario bloqueado exitosamente`;
          showSuccess(successMessage);
        } else {
          showError(
            response.message ||
              `Error al actualizar el estado del ${
                entityType === "user" ? "usuario" : "vehículo"
              }`,
          );
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsActive(newState);
        if (onToggle) onToggle(newState);

        const successMessage = newState
          ? `Vehículo reactivado exitosamente`
          : `Vehículo dado de baja exitosamente`;
        showSuccess(successMessage);
      }
    } catch (error) {
      showError(
        `Error al actualizar el estado del ${
          entityType === "user" ? "usuario" : "vehículo"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="status-toggle-container">
        <div className="status-toggle-title">
          <h2
            style={{
              color: COLORS.primary,
              fontSize: entityType === "vehicle" ? "20px" : undefined,
            }}
          >
            {config.title}
          </h2>
        </div>
        <div className="status-toggle-content">
          <span
            style={{
              fontWeight: 600,
              color: isActive ? COLORS.success : COLORS.error,
            }}
          >
            {isActive ? config.activeText : config.inactiveText}
          </span>
          {isActive ? (
            <DeleteButton
              text={isLoading ? "Procesando..." : config.deactivateButton}
              onClick={handleToggle}
              disabled={isLoading}
              loading={isLoading}
            />
          ) : (
            <ConfirmButton
              text={isLoading ? "Procesando..." : config.activateButton}
              onClick={handleToggle}
              disabled={isLoading}
              loading={isLoading}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={config.dialogTitle}
      />

      {}
      {notification.isOpen && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      )}
    </>
  );
}
