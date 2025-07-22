import { useState } from "react";
import { COLORS } from "../../common/colors";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./CarUnsubscribeButton.css";

type Props = {
  vehicleId?: string;
  active?: boolean;
  onToggle?: (newState: boolean) => void;
};

export default function CarUnsubscribeButton({
  vehicleId,
  active = true,
  onToggle,
}: Props) {
  const [isActive, setIsActive] = useState(active);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, message, showConfirm, handleConfirm, handleCancel } =
    useConfirmDialog();

  const handleToggle = () => {
    const newState = !isActive;
    const action = newState ? "reactivar" : "dar de baja";
    const message = `¿Estás seguro de que quieres ${action} este vehículo?`;

    showConfirm(message, () => updateVehicleStatusInDB(newState));
  };

  const updateVehicleStatusInDB = async (newState: boolean) => {
    console.log(`🔄 Updating vehicle ${vehicleId} to active: ${newState}`);
    setIsLoading(true);
    try {
      // Aquí puedes agregar la llamada a la API para actualizar el vehículo
      // const response = await updateVehicleStatus(vehicleId, newState);

      // Simulamos la respuesta exitosa por ahora
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("✅ Vehicle updated successfully");
      setIsActive(newState);
      if (onToggle) onToggle(newState);
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
      alert("Error al actualizar el estado del vehículo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="vehicle-state-container">
        <div className="vehicle-state-title">
          <h2 style={{ color: COLORS.primary, fontSize: "20px" }}>
            Estado del Vehículo
          </h2>
        </div>
        <div className="vehicle-state-bento">
          <span
            style={{
              fontWeight: 600,
              color: isActive ? COLORS.success : COLORS.error,
            }}
          >
            {isActive ? "Vehículo activo" : "Vehículo dado de baja"}
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
              ? "Dar de baja"
              : "Reactivar"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Cambiar estado del vehículo"
      />
    </>
  );
}
