import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Document from "../../components/Document/Document";
import MaintenanceTable from "../../components/MaintenanceTable/MaintenanceTable";
import CarUnsubscribeButton from "../../components/CarUnsubscribeButton/CarUnsubscribeButton";
import {
  getVehicleMaintenances,
  saveVehicleMaintenances,
} from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  const { id } = useParams<{ id: string }>();
  const [isVehicleActive, setIsVehicleActive] = useState(true);
  const [assignedMaintenances, setAssignedMaintenances] = useState<Set<string>>(
    new Set()
  );
  const [assignedMaintenanceNames, setAssignedMaintenanceNames] = useState<
    Map<string, string>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const vehicleId = id;

  // Cargar mantenimientos asignados al vehículo
  useEffect(() => {
    const loadMaintenanceData = async () => {
      if (!vehicleId || vehicleId.trim() === "") return;

      setLoading(true);
      try {
        console.log(
          "🔄 [VEHICLE_EDIT] Cargando mantenimientos del vehículo..."
        );

        // Cargar mantenimientos asignados al vehículo
        const vehicleMaintenancesResponse = await getVehicleMaintenances(
          vehicleId
        );
        if (vehicleMaintenancesResponse.success) {
          const assignedIds = new Set<string>(
            vehicleMaintenancesResponse.data.map(
              (maintenance: Maintenance) => maintenance.id
            )
          );
          const nameMap = new Map<string, string>(
            vehicleMaintenancesResponse.data.map((maintenance: Maintenance) => [
              maintenance.id,
              maintenance.name,
            ])
          );
          setAssignedMaintenances(assignedIds);
          setAssignedMaintenanceNames(nameMap);
          console.log(
            "✅ [VEHICLE_EDIT] Mantenimientos asignados:",
            assignedIds
          );
        } else {
          console.error(
            "💥 [VEHICLE_EDIT] Error al cargar mantenimientos:",
            vehicleMaintenancesResponse.message
          );
        }
      } catch (error) {
        console.error("💥 [VEHICLE_EDIT] Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMaintenanceData();
  }, [vehicleId]);

  // Función para manejar el cambio de estado del vehículo
  const handleVehicleStatusChange = (isActive: boolean) => {
    setIsVehicleActive(isActive);
    console.log(`Vehículo ${isActive ? "reactivado" : "dado de baja"}`);
  };

  // Función para asignar un mantenimiento al vehículo (solo local, sin backend)
  const handleAssignMaintenance = (
    maintenanceId: string,
    maintenanceName: string
  ) => {
    console.log("🔧 [VEHICLE_EDIT] Asignando mantenimiento:", {
      maintenanceId,
      maintenanceName,
    });

    setAssignedMaintenances((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(maintenanceId)) {
        // Si ya está asignado, lo removemos
        newSet.delete(maintenanceId);
        console.log(`➖ [VEHICLE_EDIT] Removido: ${maintenanceName}`);
      } else {
        // Si no está asignado, lo agregamos
        newSet.add(maintenanceId);
        console.log(`➕ [VEHICLE_EDIT] Asignado: ${maintenanceName}`);
      }
      console.log(
        "📊 [VEHICLE_EDIT] Mantenimientos asignados actuales:",
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

  // Función para guardar mantenimientos en la base de datos
  const handleSaveMaintenances = async () => {
    if (!vehicleId || vehicleId.trim() === "") return;

    setIsSaving(true);
    try {
      console.log("💾 [VEHICLE_EDIT] Guardando mantenimientos...");

      const maintenanceIds = Array.from(assignedMaintenances);
      const response = await saveVehicleMaintenances(vehicleId, maintenanceIds);

      if (response.success) {
        console.log("✅ [VEHICLE_EDIT] Mantenimientos guardados exitosamente");
        alert(
          `¡Mantenimientos guardados exitosamente! (${maintenanceIds.length} mantenimientos)`
        );
      } else {
        console.error("💥 [VEHICLE_EDIT] Error al guardar:", response.message);
        alert(`Error al guardar mantenimientos: ${response.message}`);
      }
    } catch (error) {
      console.error(
        "💥 [VEHICLE_EDIT] Error al guardar mantenimientos:",
        error
      );
      alert("Error al guardar mantenimientos");
    } finally {
      setIsSaving(false);
    }
  };

  if (!vehicleId || vehicleId.trim() === "") {
    return (
      <div className="vehicle-edit-container">
        <h2 className="title">Error: ID de vehículo no válido</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vehicle-edit-container">
        <h2 className="title">Cargando datos del vehículo...</h2>
      </div>
    );
  }

  return (
    <div className="vehicle-edit-container">
      <h2 className="title">Editar Vehículo</h2>

      <CarUnsubscribeButton
        active={isVehicleActive}
        onToggle={handleVehicleStatusChange}
      />

      <VehicleInfo isVehicleActive={isVehicleActive} vehicleId={vehicleId} />

      <TechnicalSheet />

      {/* Usar el componente MaintenanceTable */}
      <MaintenanceTable
        assignedMaintenances={assignedMaintenances}
        assignedMaintenanceNames={assignedMaintenanceNames}
        onMaintenanceAssign={handleAssignMaintenance}
        title="Mantenimientos"
        showAssignedInfo={true}
        showSaveButton={true}
        isSaving={isSaving}
        onSaveMaintenances={handleSaveMaintenances}
        width="800px"
        context="edit"
      />

      <h2 className="title">Documentación</h2>
      <Document />
    </div>
  );
}
