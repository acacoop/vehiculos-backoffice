import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Document from "../../components/Document/Document";
import { createVehicle } from "../../services/vehicles";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleRegistration.css";

export default function VehicleRegistration() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

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
