import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Document from "../../components/Document/Document";
import Table from "../../components/Table/table";
import { createVehicle } from "../../services/vehicles";
import { getMaintenanceCategories } from "../../services/maintenances";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";
import "./VehicleRegistration.css";

export default function VehicleRegistration() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  // Definición de columnas para la tabla de mantenimientos
  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      headerAlign: "center",
      align: "center",
    },
    { field: "name", headerName: "Nombre", flex: 1 },
  ];

  // Función para obtener mantenimientos desde el servicio
  const getMaintenancesForTable = async (pagination: {
    page: number;
    pageSize: number;
  }) => {
    console.log("🔍 [MAINTENANCE] Iniciando solicitud de mantenimientos...");
    console.log(
      "📄 [MAINTENANCE] Parámetros de paginación recibidos:",
      pagination
    );

    try {
      // Convertir pageSize a limit para coincidir con PaginationParams
      const paginationParams = {
        page: pagination.page,
        limit: pagination.pageSize,
      };

      console.log(
        "📤 [MAINTENANCE] Parámetros enviados al backend:",
        paginationParams
      );
      console.log("🌐 [MAINTENANCE] Llamando a getMaintenanceCategories...");

      const response = await getMaintenanceCategories(paginationParams);

      console.log("📨 [MAINTENANCE] Respuesta completa del backend:", response);
      console.log("📊 [MAINTENANCE] Tipo de respuesta:", typeof response);
      console.log("✅ [MAINTENANCE] Success:", response.success);
      console.log("📊 [MAINTENANCE] Data:", response.data);
      console.log("📊 [MAINTENANCE] Data length:", response.data?.length);
      console.log("📊 [MAINTENANCE] Data type:", typeof response.data);
      console.log("📊 [MAINTENANCE] Is array?", Array.isArray(response.data));
      console.log("💬 [MAINTENANCE] Message:", response.message);

      if (response.success) {
        console.log(
          `🎉 [MAINTENANCE] Datos obtenidos exitosamente: ${
            response.data?.length || 0
          } registros`
        );
      } else {
        console.error(
          "❌ [MAINTENANCE] Error en la respuesta:",
          response.message
        );
        console.warn(
          "🚧 [MAINTENANCE] Problema detectado: La tabla maintenance_category no existe en la BD"
        );
        console.info(
          "💡 [MAINTENANCE] Solución: Ejecutar CREATE TABLE maintenance_category..."
        );
      }

      return response;
    } catch (error) {
      console.error("💥 [MAINTENANCE] Error al obtener mantenimientos:", error);
      console.error("🔥 [MAINTENANCE] Stack trace:", (error as Error)?.stack);
      console.warn(
        "🚧 [MAINTENANCE] CAUSA PROBABLE: La tabla 'maintenance_category' no existe en la base de datos"
      );
      console.info(
        "💡 [MAINTENANCE] ACCIÓN REQUERIDA: Crear la tabla con el SQL proporcionado"
      );

      // Retornar error estructurado con tipo correcto
      return {
        success: false,
        data: [],
        message: `⚠️ TABLA NO EXISTE: maintenance_category. Error: ${
          (error as Error)?.message
        }`,
        error: error as any,
      };
    }
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

      {/* Mantenimientos */}
      <h2 className="title">Mantenimientos</h2>
      <Table
        getRows={getMaintenancesForTable}
        columns={maintenanceColumns}
        title=""
        showEditColumn={false}
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
