import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { getVehicleById } from "../../services/vehicles";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("id");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError("ID de vehículo no encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🚗 Cargando vehículo con ID:", vehicleId);
        const vehicleData = await getVehicleById(vehicleId);
        console.log("✅ Vehículo cargado:", vehicleData);
        setVehicle(vehicleData);
      } catch (err) {
        console.error("❌ Error al cargar vehículo:", err);
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
      <div className="vehicle-edit-container">
        <h1>Cargando vehículo...</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-edit-container">
        <h1>Error</h1>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-edit-container">
        <h1>Vehículo no encontrado</h1>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          No se pudo encontrar el vehículo solicitado
        </Alert>
      </div>
    );
  }

  return (
    <div className="vehicle-edit-container">
      <h1>Editar Vehículo</h1>
      <div className="vehicle-details">
        <h2>Detalles del Vehículo</h2>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>ID:</strong> {vehicle.id}
          </p>
          <p>
            <strong>Patente:</strong> {vehicle.licensePlate}
          </p>
          <p>
            <strong>Marca:</strong> {vehicle.brand}
          </p>
          <p>
            <strong>Modelo:</strong> {vehicle.model}
          </p>
          <p>
            <strong>Año:</strong> {vehicle.year}
          </p>
        </div>

        {/* Aquí puedes agregar formularios para editar el vehículo */}
        <div className="edit-form" style={{ marginTop: "2rem" }}>
          <h3>Formulario de Edición</h3>
          <p style={{ color: "#666" }}>
            Próximamente: formulario para editar los datos del vehículo
          </p>
        </div>
      </div>
    </div>
  );
}
