import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import EntityForm from "../../components/EntityForm/EntityForm";
import Document from "../../components/Document/Document";
import UserAssignmentTable from "../../components/UserAssignmentTable/UserAssignmentTable";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import { getVehicleById } from "../../services/vehicles";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  const { id } = useParams<{ id: string }>();
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicleId = id;

  // Cargar datos del vehículo
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError("ID de vehículo no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getVehicleById(vehicleId);
        if (response.success) {
          setVehicleData(response.data);
        } else {
          setError(response.message || "Error al cargar vehículo");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar vehículo"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  if (loading) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", margin: "2rem" }}
        >
          <CircularProgress />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  if (!vehicleData) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          Vehículo no encontrado
        </Alert>
      </main>
    );
  }

  return (
    <main className="vehicle-edit-container">
      <div className="vehicle-state">
        <StatusToggle
          entityId={vehicleData.id}
          entityType="vehicle"
          active={true}
          onToggle={(newState: boolean) => {
            console.log("Vehículo actualizado:", newState);
          }}
        />
      </div>

      <div className="vehicle-edit-body">
        <EntityForm
          entityType="vehicle"
          entityId={vehicleData.id}
          data={vehicleData}
          onDataChange={(newData: Vehicle) => setVehicleData(newData)}
        />
      </div>

      <div className="vehicle-edit-body">
        <EntityForm
          entityType="technical"
          entityId={vehicleData.id}
          data={vehicleData}
          onDataChange={(newData: Vehicle) => setVehicleData(newData)}
        />
      </div>

      <div className="vehicle-edit-body">
        <UserAssignmentTable
          title="Asignar Usuarios al Vehículo"
          width="900px"
          vehicleId={vehicleId}
        />
      </div>

      <Document />
    </main>
  );
}
