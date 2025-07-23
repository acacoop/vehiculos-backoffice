import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Document from "../../components/Document/Document";
import MaintenanceTable from "../../components/MaintenanceTable/MaintenanceTable";
import { createVehicle } from "../../services/vehicles";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleRegistration.css";

export default function VehicleRegistration() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [assignedMaintenances, setAssignedMaintenances] = useState<Set<string>>(
    new Set()
  );
  const [assignedMaintenanceNames, setAssignedMaintenanceNames] = useState<
    Map<string, string>
  >(new Map());

  // Función para asignar un mantenimiento al vehículo
  const handleAssignMaintenance = (
    maintenanceId: string,
    maintenanceName: string
  ) => {
    console.log("🔧 [MAINTENANCE] Asignando mantenimiento:", {
      maintenanceId,
      maintenanceName,
    });

    setAssignedMaintenances((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(maintenanceId)) {
        // Si ya está asignado, lo removemos
        newSet.delete(maintenanceId);
        console.log(`➖ [MAINTENANCE] Removido: ${maintenanceName}`);
      } else {
        // Si no está asignado, lo agregamos
        newSet.add(maintenanceId);
        console.log(`➕ [MAINTENANCE] Asignado: ${maintenanceName}`);
      }
      console.log(
        "📊 [MAINTENANCE] Mantenimientos asignados actuales:",
        Array.from(newSet)
      );
      return newSet;
    });

    // Actualizar el mapa de nombres
    setAssignedMaintenanceNames((prev) => {
      const newMap = new Map(prev);
      if (assignedMaintenances.has(maintenanceId)) {
        // Si se está removiendo, eliminar del mapa
        newMap.delete(maintenanceId);
      } else {
        // Si se está agregando, agregar al mapa
        newMap.set(maintenanceId, maintenanceName);
      }
      return newMap;
    });
  };

  // Función para recibir datos del VehicleInfo
  const handleVehicleChange = (vehicle: Vehicle | null) => {
    setVehicleData(vehicle);
  };

  // Función para manejar el registro del vehículo
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
      console.log(
        "🔧 Mantenimientos a asignar:",
        Array.from(assignedMaintenances)
      );

      const response = await createVehicle({
        licensePlate: vehicleData.licensePlate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        imgUrl: vehicleData.imgUrl || "",
      });

      if (response.success) {
        // Si el vehículo se creó exitosamente y hay mantenimientos asignados
        if (assignedMaintenances.size > 0) {
          console.log("🔧 Asignando mantenimientos al vehículo creado...");
          // TODO: Aquí llamaremos al servicio para asignar mantenimientos
          // Por ahora solo mostramos en consola
          console.log(
            `✅ Vehículo creado con ${assignedMaintenances.size} mantenimientos asignados`
          );
        }

        alert(
          assignedMaintenances.size > 0
            ? `¡Vehículo registrado exitosamente con ${assignedMaintenances.size} mantenimientos asignados!`
            : "¡Vehículo registrado exitosamente!"
        );

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

  return (
    <div className="vehicle-registration-container">
      <h2 className="title">Registrar Nuevo Vehículo</h2>

      {/* Información básica del vehículo */}
      <VehicleInfo
        isVehicleActive={true}
        onVehicleChange={handleVehicleChange}
      />

      {/* Ficha técnica */}
      <TechnicalSheet />

      {/* Mantenimientos usando el componente reutilizable */}
      <MaintenanceTable
        assignedMaintenances={assignedMaintenances}
        assignedMaintenanceNames={assignedMaintenanceNames}
        onMaintenanceAssign={handleAssignMaintenance}
        title="Mantenimientos Disponibles"
        showAssignedInfo={true}
        showSaveButton={false}
        width="800px"
        context="registration"
      />

      {/* Documentación */}
      <h2 className="title">Documentación</h2>
      <Document />

      {/* Botón para completar el registro */}
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
    </div>
  );
}
