import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid";
import EntityForm from "../../components/EntityForm/EntityForm";
import Document from "../../components/Document/Document";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import Table from "../../components/Table/table";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { createVehicle } from "../../services/vehicles";
import { getAssignments } from "../../services/assignments";
import { getVehicleMaintenances } from "../../services/maintenances";
import { getReservationsByVehicle } from "../../services/reservations";
import { VehicleKilometersService } from "../../services/kilometers";
import { useNotification } from "../../hooks";
import type { Vehicle } from "../../types/vehicle";
import type { Assignment } from "../../types/assignment";
import type { ReservationWithUser } from "../../types/reservation";
import type { PaginationParams, ServiceResponse } from "../../common";
import "./VehicleEditRegistration.css";

export default function VehicleEditRegistration() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isCreateMode = location.pathname.includes("/create");
  const vehicleId = id;

  const [isVehicleActive, setIsVehicleActive] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [refreshTables, setRefreshTables] = useState(0);

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const handleFocus = () => {
      setRefreshTables((prev) => prev + 1);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);
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
        if (params.row.endDate && params.row.endDate.trim() !== "") {
          const date = new Date(params.row.endDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Indefinida";
      },
    },
  ];

  const maintenanceColumns: GridColDef<any>[] = [
    {
      field: "id",
      headerName: "ID Asignación",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.row.id?.slice(0, 8) + "..." || "N/A",
    },
    {
      field: "maintenance_category_name",
      headerName: "Categoría de Mantenimiento",
      width: 300,
      flex: 1,
      renderCell: (params) =>
        params.row.maintenance_category_name ||
        params.row.name ||
        "Sin categoría",
    },
    {
      field: "kilometers_frequency",
      headerName: "Frecuencia (KM)",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const km = params.row.kilometers_frequency;
        return km ? `${km.toLocaleString()} km` : "N/A";
      },
    },
    {
      field: "days_frequency",
      headerName: "Frecuencia (Días)",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const days = params.row.days_frequency;
        return days ? `${days} días` : "N/A";
      },
    },
  ];

  const reservationColumns: GridColDef<ReservationWithUser>[] = [
    {
      field: "user.lastName",
      headerName: "Apellido",
      width: 150,
      renderCell: (params) => params.row.user?.lastName || "N/A",
    },
    {
      field: "user.firstName",
      headerName: "Nombre",
      width: 150,
      renderCell: (params) => params.row.user?.firstName || "N/A",
    },
    {
      field: "startDate",
      headerName: "Fecha y Hora Inicio",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.startDate) {
          const date = new Date(params.row.startDate);
          const dateStr = date.toLocaleDateString("es-AR");
          const timeStr = date.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${dateStr} ${timeStr}`;
        }
        return "Sin fecha";
      },
    },
    {
      field: "endDate",
      headerName: "Fecha y Hora Fin",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.endDate) {
          const date = new Date(params.row.endDate);
          const dateStr = date.toLocaleDateString("es-AR");
          const timeStr = date.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${dateStr} ${timeStr}`;
        }
        return "Sin fecha";
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => {
        const now = new Date();
        const startDate = new Date(row.startDate);
        const endDate = new Date(row.endDate);

        if (now >= startDate && now <= endDate) {
          return "Activa";
        } else {
          return "Finalizada";
        }
      },
      renderCell: (params) => {
        const now = new Date();
        const startDate = new Date(params.row.startDate);
        const endDate = new Date(params.row.endDate);

        if (now >= startDate && now <= endDate) {
          return (
            <span style={{ color: "#4caf50", fontWeight: "bold" }}>Activa</span>
          );
        } else {
          return (
            <span style={{ color: "#E53935", fontWeight: "bold" }}>
              Finalizada
            </span>
          );
        }
      },
    },
  ];

  const mileageColumns: GridColDef[] = [
    {
      field: "date",
      headerName: "Fecha de Registro",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.date) {
          const date = new Date(params.row.date);
          return date.toLocaleDateString("es-AR");
        }
        return "Sin fecha";
      },
    },
    {
      field: "mileage",
      headerName: "Kilometraje",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const km = params.row.mileage || params.row.kilometers;
        return km ? `${km.toLocaleString()} km` : "N/A";
      },
    },
    {
      field: "notes",
      headerName: "Observaciones",
      flex: 1,
      minWidth: 200,
      renderCell: (params) =>
        params.row.notes || params.row.observations || "Sin observaciones",
    },
    {
      field: "createdBy",
      headerName: "Registrado por",
      width: 180,
      renderCell: (params) => params.row.createdBy || params.row.user || "N/A",
    },
  ];

  const getAssignmentsForTable = async (paginationParams: PaginationParams) => {
    try {
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

  const getMaintenancesForTable = async (
    paginationParams: PaginationParams
  ): Promise<ServiceResponse<any[]>> => {
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

      if (response.success) {
        const data = response.data || [];
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

  const getReservationsForTable = async (
    paginationParams: PaginationParams
  ): Promise<ServiceResponse<ReservationWithUser[]>> => {
    try {
      if (!vehicleId) {
        return {
          success: false,
          data: [],
          message: "ID de vehículo no proporcionado",
          error: undefined,
        };
      }

      const response = await getReservationsByVehicle(
        vehicleId,
        paginationParams
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as ReservationWithUser[],
          message: response.message,
          pagination: response.pagination,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || "No se pudieron obtener las reservas",
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener reservas: ${(error as Error)?.message}`,
        error: error as any,
      };
    }
  };

  const getMileageForTable = async (
    paginationParams: PaginationParams
  ): Promise<ServiceResponse<any[]>> => {
    if (!vehicleId) {
      return {
        success: false,
        data: [],
        message: "ID del vehículo no disponible",
        error: {
          type: "validation_error",
          title: "Vehicle ID Required",
          status: 400,
          detail: "Vehicle ID is required to fetch kilometers data",
        },
      };
    }

    try {
      const result =
        await VehicleKilometersService.getVehicleKilometersForTable(
          vehicleId,
          paginationParams
        );

      return {
        success: result.success,
        data: result.data,
        message: result.message,
        pagination: result.pagination,
        error: result.error,
      };
    } catch (error) {
      console.error("Error fetching kilometers data:", error);
      return {
        success: false,
        data: [],
        message: `Error al obtener historial de kilometraje: ${
          (error as Error)?.message
        }`,
        error: {
          type: "api_error",
          title: "Failed to fetch kilometers",
          status: 500,
          detail: (error as Error)?.message,
        },
      };
    }
  };

  const handleVehicleStatusChange = (isActive: boolean) => {
    setIsVehicleActive(isActive);
  };

  const handleVehicleChange = (vehicle: Vehicle | null) => {
    setVehicleData(vehicle);
  };

  const handleVehicleRegistration = async () => {
    if (!vehicleData) {
      showError("Por favor completa la información del vehículo");
      return;
    }

    if (!vehicleData.licensePlate || !vehicleData.brand || !vehicleData.model) {
      showError(
        "Por favor completa todos los campos obligatorios (Patente, Marca, Modelo)"
      );
      return;
    }

    setIsRegistering(true);

    try {
      const response = await createVehicle({
        licensePlate: vehicleData.licensePlate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        imgUrl: vehicleData.imgUrl || "https://via.placeholder.com/150",
      });

      if (response.success) {
        showSuccess("¡Vehículo registrado exitosamente!");
        setTimeout(() => {
          navigate("/vehicles");
        }, 1500);
      } else {
        showError(`Error al registrar vehículo: ${response.message}`);
      }
    } catch (error) {
      showError("Error al registrar el vehículo");
    } finally {
      setIsRegistering(false);
    }
  };

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

      {!isCreateMode && vehicleId && (
        <StatusToggle
          entityId={vehicleId}
          entityType="vehicle"
          active={isVehicleActive}
          onToggle={handleVehicleStatusChange}
        />
      )}

      <EntityForm
        entityType="vehicle"
        entityId={isCreateMode ? undefined : vehicleId}
        onDataChange={isCreateMode ? handleVehicleChange : undefined}
        isActive={isVehicleActive}
        showActions={!isCreateMode}
      />

      <EntityForm entityType="technical" showActions={!isCreateMode} />

      {!isCreateMode && vehicleId && (
        <Table<any>
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

      {!isCreateMode && vehicleId && (
        <Table<ReservationWithUser>
          key={`reservations-${vehicleId}-${refreshTables}`}
          getRows={getReservationsForTable}
          columns={reservationColumns}
          title=""
          showEditColumn={true}
          editRoute="/reservation/edit"
          showTableHeader={true}
          headerTitle="Reservas del Vehículo"
          showAddButton={true}
          addButtonText="+ Nueva Reserva"
          onAddButtonClick={() =>
            navigate(`/reservation/create?vehicleId=${vehicleId}`)
          }
          maxWidth="900px"
        />
      )}

      {!isCreateMode && vehicleId && (
        <Table<any>
          getRows={getMileageForTable}
          columns={mileageColumns}
          title=""
          showEditColumn={false}
          showTableHeader={true}
          headerTitle="Historial de Kilometraje registrado"
          showAddButton={true}
          addButtonText="+ Agregar nuevo registro"
          onAddButtonClick={() => navigate(`/kilometers/create/${vehicleId}`)}
          maxWidth="900px"
          tableWidth="900px"
        />
      )}

      <Document
        title="Documentos del Vehículo"
        initialDocuments={[
          {
            id: "1",
            title: "Registro del Vehículo",
            expirationDate: "2024-12-31",
            fileName: "registro_vehiculo.pdf",
            uploadDate: "2024-01-15",
          },
          {
            id: "2",
            title: "Seguro del Vehículo",
            expirationDate: "2024-08-15",
            fileName: "seguro_auto.pdf",
            uploadDate: "2024-02-01",
          },
          {
            id: "3",
            title: "Revisión Técnica",
            expirationDate: "2024-10-20",
            fileName: "revision_tecnica.pdf",
            uploadDate: "2024-03-10",
          },
          {
            id: "4",
            title: "Manual del Usuario",
            fileName: "manual_usuario.pdf",
            uploadDate: "2024-01-01",
          },
        ]}
      />

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

      {notification.isOpen && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}
