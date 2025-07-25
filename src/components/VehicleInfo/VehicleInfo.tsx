import { useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { getVehicleById, updateVehicle } from "../../services/vehicles"; // Agregar updateVehicle
import type { Vehicle } from "../../types/vehicle";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./VehicleInfo.css";

type Props = {
  isVehicleActive?: boolean;
  onVehicleChange?: (vehicle: Vehicle | null) => void;
  vehicleId?: string; // Prop opcional para pasar el ID directamente
  showActions?: boolean; // Prop para controlar si se muestran las acciones
};

export default function VehicleInfo({
  isVehicleActive = true,
  onVehicleChange,
  vehicleId: propVehicleId,
  showActions = true,
}: Props) {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams<{ id: string }>();

  // Determinar el ID del vehículo: prop > parámetro de ruta > query param
  const vehicleId = propVehicleId || paramId || searchParams.get("id");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false); // Estado para el dialog
  const [updating, setUpdating] = useState(false); // Estado para loading del update

  useEffect(() => {
    const fetchVehicle = async () => {
      // Si no hay vehicleId, estamos en modo registro
      if (!vehicleId) {
        console.log("🆕 Modo registro - inicializando vehículo vacío");
        setVehicle({
          id: "",
          licensePlate: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          imgUrl: "",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🚗 Cargando vehículo con ID:", vehicleId);
        const response = await getVehicleById(vehicleId);
        console.log("🔄 Respuesta del servicio:", response);

        if (response.success) {
          console.log("✅ Vehículo cargado:", response.data);
          setVehicle(response.data);
        } else {
          console.error("❌ Error en respuesta:", response.message);
          setError(response.message || "Error al cargar vehículo");
        }
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

  // Notificar cambios en el vehículo al componente padre
  useEffect(() => {
    if (onVehicleChange) {
      onVehicleChange(vehicle);
    }
  }, [vehicle, onVehicleChange]);

  const handleConfirmClick = () => {
    setShowDialog(true); // Siempre mostrar el dialog, sin verificar cambios
  };

  // Función para confirmar los cambios
  const handleConfirmSave = async () => {
    if (!vehicle) return;

    try {
      setUpdating(true);

      if (vehicleId) {
        // Modo edición - actualizar vehículo existente
        console.log("💾 Actualizando vehículo:", vehicle);
        const response = await updateVehicle(vehicleId, {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
        });

        if (response.success) {
          console.log("✅ Vehículo actualizado exitosamente");
          setShowDialog(false);
        } else {
          console.error("❌ Error al actualizar:", response.message);
          setError(response.message || "Error al actualizar vehículo");
        }
      } else {
        // Modo registro - guardar datos localmente
        console.log("💾 Guardando datos del nuevo vehículo:", vehicle);
        setShowDialog(false);
        alert(
          "Datos guardados. Completa todos los campos y presiona 'Registrar Vehículo'"
        );
      }
    } catch (err) {
      console.error("❌ Error al actualizar vehículo:", err);
      setError(
        err instanceof Error ? err.message : "Error al actualizar vehículo"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Función para cancelar
  const handleCancel = () => {
    setShowDialog(false);
  };

  if (loading) {
    return (
      <div className="vehicle-details">
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
      <div className="vehicle-details">
        <h1>Error</h1>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-detailsr">
        <h1>Vehículo no encontrado</h1>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          No se pudo encontrar el vehículo solicitado
        </Alert>
      </div>
    );
  }

  return (
    <div className="vehicle-details">
      <div className="vehicle-details-header">
        <div className="vehicle-info">
          <h2 style={{ color: "#282d86", fontSize: 20 }}>
            {vehicleId
              ? "Detalles del Vehículo"
              : "Información del Nuevo Vehículo"}
          </h2>
          <div className="vehicle-field">
            <p className="vehicle-label">Dominio</p>
            <input
              type="text"
              value={vehicle.licensePlate}
              onChange={(e) =>
                setVehicle({ ...vehicle, licensePlate: e.target.value })
              }
              disabled={!isVehicleActive}
            />
          </div>
          <div className="vehicle-field">
            <p className="vehicle-label">Marca</p>
            <input
              type="text"
              value={vehicle.brand}
              onChange={(e) =>
                setVehicle({ ...vehicle, brand: e.target.value })
              }
              disabled={!isVehicleActive}
            />
          </div>
          <div className="vehicle-field">
            <p className="vehicle-label">Modelo</p>
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) =>
                setVehicle({ ...vehicle, model: e.target.value })
              }
              disabled={!isVehicleActive}
            />
          </div>
          <div className="vehicle-field">
            <p className="vehicle-label">Año</p>
            <input
              type="number"
              className="no-spinner"
              value={vehicle.year}
              onChange={(e) =>
                setVehicle({ ...vehicle, year: Number(e.target.value) })
              }
              disabled={!isVehicleActive}
            />
          </div>
        </div>
      </div>
      {showActions && (
        <div className="vehicle-actions">
          <button
            className="confirm-button"
            onClick={handleConfirmClick}
            disabled={updating}
            style={{
              opacity: updating ? 0.5 : 1,
              cursor: updating ? "not-allowed" : "pointer",
            }}
          >
            {updating ? "Guardando..." : vehicleId ? "Confirmar" : "Guardar"}
          </button>
        </div>
      )}

      {showDialog && (
        <ConfirmDialog
          open={showDialog}
          title={vehicleId ? "Confirmar cambios" : "Guardar información"}
          message={
            vehicleId
              ? "¿Estás seguro de que quieres guardar los cambios en este vehículo?"
              : "¿Estás seguro de que quieres guardar la información del vehículo?"
          }
          onConfirm={handleConfirmSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
