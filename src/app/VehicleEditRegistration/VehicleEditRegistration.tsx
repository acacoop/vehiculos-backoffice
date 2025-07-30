import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid";
import EntityForm from "../../components/EntityForm/EntityForm";
import Document from "../../components/Document/Document";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import Table from "../../components/Table/table";
import { createVehicle } from "../../services/vehicles";
import { getAssignments } from "../../services/assignments";
import { getVehicleMaintenances } from "../../services/maintenances";
import type { Vehicle } from "../../types/vehicle";
import type { Assignment } from "../../types/assignment";
import type { Maintenance } from "../../types/maintenance";
import type { PaginationParams, ServiceResponse } from "../../common";
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

  // Definición de columnas para la tabla de asignaciones
  const assignmentColumns: GridColDef<Assignment>[] = [
    {
      field: "user.dni",
      headerName: "DNI",
      width: 110,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.row.user.dni?.toLocaleString() || "Sin DNI",
    },
    {
      field: "user.lastName",
      headerName: "Apellido",
      width: 150,
      renderCell: (params) => params.row.user.lastName,
    },
    {
      field: "user.firstName",
      headerName: "Nombre",
      width: 150,
      renderCell: (params) => params.row.user.firstName,
    },
    {
      field: "startDate",
      headerName: "Fecha Desde",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.startDate) {
          const date = new Date(params.row.startDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Sin fecha";
      },
    },
    {
      field: "endDate",
      headerName: "Fecha Hasta",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.endDate) {
          const date = new Date(params.row.endDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Activa";
      },
    },
  ];

  // Definición de columnas para la tabla de mantenimientos
  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "name",
      headerName: "Nombre del Mantenimiento",
      width: 300,
      flex: 1,
      renderCell: (params) => params.row.name,
    },
  ];

  // Función para obtener asignaciones
  const getAssignmentsForTable = async (paginationParams: PaginationParams) => {
    try {
      // Filtrar por vehicleId si se proporciona
      const filterParams = vehicleId ? { vehicleId } : {};
      const response = await getAssignments(filterParams, paginationParams);
      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener asignaciones: ${(error as Error)?.message}`,
        error: error as any,
      };
    }
  };

  // Función para obtener mantenimientos del vehículo
  const getMaintenancesForTable = async (
    paginationParams: PaginationParams
  ): Promise<ServiceResponse<Maintenance[]>> => {
    try {
      if (!vehicleId) {
        return {
          success: false,
          data: [],
          message: "ID de vehículo no proporcionado",
          error: undefined,
        };
      }

      const response = await getVehicleMaintenances(vehicleId);

      // Adaptar la respuesta para incluir paginación si es necesario
      if (response.success) {
        const data = response.data || [];

        // Simular paginación local si el backend no la maneja
        const { page = 1, limit = 20 } = paginationParams;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedData,
          message: response.message,
          pagination: {
            page,
            pageSize: limit,
            total: data.length,
            pages: Math.ceil(data.length / limit),
          },
        };
      }

      return {
        success: response.success,
        data: response.data || [],
        message: response.message,
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener mantenimientos: ${
          (error as Error)?.message
        }`,
        error: error as any,
      };
    }
  };

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

      {/* Tabla de mantenimientos - Solo en modo edición */}
      {!isCreateMode && vehicleId && (
        <Table<Maintenance>
          getRows={getMaintenancesForTable}
          columns={maintenanceColumns}
          title=""
          showEditColumn={false}
          showTableHeader={true}
          headerTitle="Mantenimientos del Vehículo"
          maxWidth="900px"
          tableWidth="900px"
          showAddButton={true}
          addButtonText="+ Agregar mantenimiento"
        />
      )}

      {/* Tabla de asignación de usuarios - Solo en modo edición */}
      {!isCreateMode && vehicleId && (
        <Table<Assignment>
          getRows={getAssignmentsForTable}
          columns={assignmentColumns}
          title=""
          showEditColumn={true}
          editRoute="/assignment/edit"
          showTableHeader={true}
          headerTitle="Asignar Usuarios al Vehículo"
          showAddButton={true}
          addButtonText="+ Agregar Asignación"
          onAddButtonClick={() =>
            navigate(
              vehicleId
                ? `/assignment/create/${vehicleId}`
                : "/assignment/create"
            )
          }
          maxWidth="900px"
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
