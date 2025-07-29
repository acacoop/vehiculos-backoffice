import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import EntityForm from "../../components/EntityForm/EntityForm";
import Document from "../../components/Document/Document";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import UserAssignmentTable from "../../components/UserAssignmentTable/UserAssignmentTable";
import { createVehicle } from "../../services/vehicles";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleEditRegistration.css";

export default function VehicleEditRegistration() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar si estamos en modo creación o edición
  const isCreateMode = location.pathname.includes("/create");
  const vehicleId = id;

  // Estados
  const [isVehicleActive, setIsVehicleActive] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  // Función para manejar el cambio de estado del vehículo (solo en modo edición)
  const handleVehicleStatusChange = (isActive: boolean) => {
    setIsVehicleActive(isActive);
    console.log(`Vehículo ${isActive ? "reactivado" : "dado de baja"}`);
  };

  // Función para recibir datos del VehicleInfo (solo en modo creación)
  const handleVehicleChange = (vehicle: Vehicle | null) => {
    setVehicleData(vehicle);
  };

  // Función para manejar el registro del vehículo (solo en modo creación)
  const handleVehicleRegistration = async () => {
    if (!vehicleData) {
      alert("Por favor completa la información del vehículo");
      return;
    }

    // Validar campos obligatorios
    if (!vehicleData.licensePlate || !vehicleData.brand || !vehicleData.model) {
      alert(
        "Por favor completa todos los campos obligatorios (Patente, Marca, Modelo)"
      );
      return;
    }

    setIsRegistering(true);

    try {
      console.log("🚗 Registrando nuevo vehículo...", vehicleData);

      const response = await createVehicle({
        licensePlate: vehicleData.licensePlate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        imgUrl: vehicleData.imgUrl || "",
      });

      if (response.success) {
        alert("¡Vehículo registrado exitosamente!");
        // Navegar de vuelta a la lista de vehículos
        navigate("/vehicles");
      } else {
        alert(`Error al registrar vehículo: ${response.message}`);
      }
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
      alert("Error al registrar el vehículo");
    } finally {
      setIsRegistering(false);
    }
  };

  // Validación para modo edición
  if (!isCreateMode && (!vehicleId || vehicleId.trim() === "")) {
    return (
      <div className="vehicle-edit-registration-container">
        <h2 className="title">Error: ID de vehículo no válido</h2>
      </div>
    );
  }

  return (
    <div className="vehicle-edit-registration-container">
      <h2 className="title">
        {isCreateMode ? "Registrar Nuevo Vehículo" : "Editar Vehículo"}
      </h2>

      {/* Botón de estado del vehículo - Solo en modo edición */}
      {!isCreateMode && vehicleId && (
        <StatusToggle
          entityId={vehicleId}
          entityType="vehicle"
          active={isVehicleActive}
          onToggle={handleVehicleStatusChange}
        />
      )}

      {/* Información del vehículo - Siempre presente */}
      <EntityForm
        entityType="vehicle"
        entityId={isCreateMode ? undefined : vehicleId}
        onDataChange={isCreateMode ? handleVehicleChange : undefined}
        isActive={isVehicleActive}
        showActions={!isCreateMode}
      />

      {/* Ficha técnica - Siempre presente */}
      <EntityForm entityType="technical" showActions={!isCreateMode} />

      {/* TODO: Agregar tabla de mantenimientos cuando esté disponible - Solo en modo edición */}
      {!isCreateMode && vehicleId && (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          <p>Tabla de mantenimientos - Pendiente de implementar</p>
        </div>
      )}

      {/* Tabla de asignación de usuarios - Solo en modo edición */}
      {!isCreateMode && vehicleId && (
        <UserAssignmentTable
          title="Asignar Usuarios al Vehículo"
          width="900px"
          vehicleId={vehicleId}
        />
      )}

      {/* Documentación - Siempre presente */}
      <Document />

      {/* Botón de registro - Solo en modo creación */}
      {isCreateMode && (
        <div className="registration-actions">
          <button
            className="register-button"
            onClick={handleVehicleRegistration}
            disabled={isRegistering}
            style={{
              opacity: isRegistering ? 0.6 : 1,
              cursor: isRegistering ? "not-allowed" : "pointer",
            }}
          >
            {isRegistering ? "Registrando..." : "Registrar Vehículo"}
          </button>
        </div>
      )}
    </div>
  );
}
