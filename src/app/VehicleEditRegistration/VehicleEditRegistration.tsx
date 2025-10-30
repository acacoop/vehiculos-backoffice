import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid";
import EntityForm from "../../components/EntityForm/EntityForm";
import Table, { PencilIcon } from "../../components/Table/table";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { LoadingSpinner } from "../../components";
import { createVehicle } from "../../services/vehicles";
import { getVehicleModelById } from "../../services/vehicleModels";
import { getAssignments } from "../../services/assignments";
import { getVehicleResponsibles } from "../../services/vehicleResponsibles";
import { getVehicleMaintenances } from "../../services/maintenances";
import { getMaintenanceRecordsByVehicle } from "../../services/maintenanceRecords";
import { VehicleKilometersService } from "../../services/kilometers";
import { getReservationsByVehicle } from "../../services/reservations";
import { useNotification } from "../../hooks";
import type { Vehicle } from "../../types/vehicle";
import type { Assignment } from "../../types/assignment";
import type { PaginationParams, ServiceResponse } from "../../common";
import "./VehicleEditRegistration.css";

export default function VehicleEditRegistration() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isCreateMode = location.pathname.includes("/create");
  const vehicleId = id;

  const [isVehicleActive, _setIsVehicleActive] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [technicalData, setTechnicalData] = useState({
    chassisNumber: "",
    engineNumber: "",
    vehicleType: "",
    transmission: "",
    fuelType: "",
    allowedVehicleTypes: [] as string[] | undefined,
  });

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const handleFocus = () => {};

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);
  const assignmentColumns: GridColDef<Assignment>[] = [
    {
      field: "user.cuit",
      headerName: "CUIT",
      width: 110,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.row.user.cuit?.toLocaleString() || "Sin CUIT",
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
      field: "maintenance_category_name",
      headerName: "Categoría Mantenimiento",
      width: 250,
      flex: 1,
      renderCell: (params) =>
        params.row.maintenance_category_name ||
        params.row.category ||
        "Sin categoría",
    },
    {
      field: "name",
      headerName: "Nombre de Mantenimiento",
      width: 300,
      flex: 1,
      renderCell: (params) =>
        params.row.name ||
        params.row.title ||
        params.row.maintenance_name ||
        "Sin nombre",
    },
    {
      field: "daysFrequency",
      headerName: "Frecuencia (Días)",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        // Buscar en múltiples campos posibles para días
        const days =
          params.row.daysFrequency ||
          params.row.days_frequency ||
          params.row.dayFrequency;
        return days && days > 0 ? `${days} días` : "N/A";
      },
    },
    {
      field: "kilometersFrequency",
      headerName: "Frecuencia (KM)",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        // Buscar en múltiples campos posibles para kilómetros
        const km =
          params.row.kilometersFrequency ||
          params.row.kilometers_frequency ||
          params.row.kmFrequency;
        return km && km > 0 ? `${km.toLocaleString()} km` : "N/A";
      },
    },
  ];

  // Columnas para registros de mantenimiento
  const maintenanceRecordColumns: GridColDef<any>[] = [
    {
      field: "date",
      headerName: "Fecha",
      width: 150,
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
      field: "kilometers",
      headerName: "Kilómetros",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const km = params.row.kilometers;
        return km ? `${km.toLocaleString()} km` : "N/A";
      },
    },
    {
      field: "notes",
      headerName: "Observaciones",
      width: 300,
      flex: 1,
      renderCell: (params) => params.row.notes || "Sin observaciones",
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
      field: "createdBy",
      headerName: "Registrado por",
      width: 180,
      renderCell: (params) => params.row.createdBy || params.row.user || "N/A",
    },
  ];

  const reservationColumns: GridColDef<any>[] = [
    {
      field: "user",
      headerName: "Usuario",
      width: 200,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => {
        if (row.user) {
          return `${row.user.firstName} ${row.user.lastName}`;
        }
        return row.userId || "N/A";
      },
      renderCell: (params) => {
        if (params.row.user) {
          return `${params.row.user.firstName} ${params.row.user.lastName}`;
        }
        return params.row.userId || "N/A";
      },
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

        if (now < startDate) {
          return "Programada";
        } else if (now >= startDate && now <= endDate) {
          return "Activa";
        } else {
          return "Finalizada";
        }
      },
      renderCell: (params) => {
        const now = new Date();
        const startDate = new Date(params.row.startDate);
        const endDate = new Date(params.row.endDate);

        if (now < startDate) {
          return (
            <span style={{ color: "#FF9800", fontWeight: "bold" }}>
              Programada
            </span>
          );
        } else if (now >= startDate && now <= endDate) {
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

  const getAssignmentsForTable = async (
    paginationParams: PaginationParams,
    options?: { search?: string }
  ) => {
    try {
      const filterParams = {
        ...(vehicleId && { vehicleId }),
        ...(options?.search && { search: options.search }),
      };
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

  const getMileageForTable = async (
    paginationParams: PaginationParams,
    options?: { search?: string }
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
          paginationParams,
          options
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

  const getReservationsForTable = async (
    paginationParams: PaginationParams,
    options?: { search?: string }
  ) => {
    if (!vehicleId) {
      return {
        success: false,
        data: [],
        message: "No se ha seleccionado ningún vehículo",
      };
    }

    try {
      const combinedParams = {
        ...paginationParams,
        ...(options?.search && { search: options.search }),
      };
      const response = await getReservationsByVehicle(
        vehicleId,
        combinedParams
      );
      if (response.success) {
        return {
          success: true,
          data: response.data,
          pagination: response.pagination,
          message: response.message,
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener reservas: ${(error as Error)?.message}`,
      };
    }
  };

  const handleVehicleChange = useCallback((vehicle: Vehicle | null) => {
    setVehicleData(vehicle);
  }, []);

  useEffect(() => {
    if (!isCreateMode) return;
    const modelId = vehicleData?.modelId;

    if (!modelId) {
      setTechnicalData((prev) => ({
        ...prev,
        vehicleType: "",
        allowedVehicleTypes: undefined,
      }));
      return;
    }

    (async () => {
      try {
        const resp = await getVehicleModelById(modelId);
        if (resp.success && resp.data) {
          const vt = resp.data.vehicleType || "";
          setTechnicalData((prev) => ({
            ...prev,
            vehicleType: vt || prev.vehicleType,
          }));
        }
      } catch {
        // ignore
      }
    })();
  }, [isCreateMode, vehicleData?.modelId]);

  const handleVehicleRegistration = async () => {
    if (!vehicleData) {
      showError("Por favor completa la información del vehículo");
      return;
    }

    if (!vehicleData.licensePlate || !vehicleData.modelId) {
      showError("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsRegistering(true);

    try {
      const merged = { ...vehicleData, ...technicalData };
      const response = await createVehicle(merged);

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
    <>
      <LoadingSpinner
        message="Registrando vehículo..."
        visible={isRegistering}
      />
      <div className="vehicle-edit-registration-container">
        <h2 className="title">
          {isCreateMode ? "Registrar Nuevo Vehículo" : "Editar Vehículo"}
        </h2>

        <EntityForm
          entityType="vehicle"
          entityId={isCreateMode ? undefined : vehicleId}
          onDataChange={handleVehicleChange}
          isActive={isVehicleActive}
          showActions={!isCreateMode}
        />

        <EntityForm
          entityType="technical"
          entityId={isCreateMode ? undefined : vehicleId}
          data={isCreateMode ? technicalData : undefined}
          onDataChange={isCreateMode ? setTechnicalData : undefined}
          externalVehicleModelId={
            (vehicleData as any)?.modelId ||
            (vehicleData as any)?.modelObj?.id ||
            undefined
          }
          showActions={!isCreateMode}
        />

        {!isCreateMode && vehicleId && (
          <>
            <Table<any>
              getRows={async (paginationParams, options) => {
                try {
                  const filters = {
                    ...(vehicleId && { vehicleId }),
                    ...(options?.search && { search: options.search }),
                  };
                  const response = await getVehicleResponsibles(
                    filters,
                    paginationParams
                  );
                  return response as ServiceResponse<any[]>;
                } catch (error) {
                  return {
                    success: false,
                    data: [],
                    message: `Error al obtener responsables: ${
                      (error as Error)?.message
                    }`,
                    error: error as any,
                  };
                }
              }}
              columns={assignmentColumns}
              title=""
              showEditColumn={true}
              editRoute="/edit-vehicle-responsibles"
              editColumnWidth={100}
              showTableHeader={true}
              headerTitle="Responsable de Vehículo"
              showAddButton={true}
              addButtonText={"+ Agregar Responsable"}
              onAddButtonClick={() =>
                navigate(`/edit-vehicle-responsibles?vehicleId=${vehicleId}`)
              }
              maxWidth="900px"
              enableSearch={true}
              searchPlaceholder="Buscar responsables..."
            />

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
              enableSearch={true}
              searchPlaceholder="Buscar asignaciones..."
            />

            <Table<any>
              getRows={getMileageForTable}
              columns={mileageColumns}
              title=""
              showEditColumn={false}
              showTableHeader={true}
              headerTitle="Historial de Kilometraje registrado"
              showAddButton={true}
              addButtonText="+ Agregar nuevo registro"
              onAddButtonClick={() =>
                navigate(`/kilometers/create/${vehicleId}`)
              }
              maxWidth="900px"
              tableWidth="900px"
              enableSearch={true}
              searchPlaceholder="Buscar kilometraje..."
            />

            <Table<any>
              getRows={getMaintenancesForTable}
              columns={maintenanceColumns}
              title=""
              showEditColumn={true}
              customEditCell={(params) => (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const maintenanceId =
                      params.row.maintenance_id ||
                      params.row.maintenanceId ||
                      params.row.id;
                    const assignmentId =
                      params.row.id || params.row.assignment_id;
                    navigate(
                      `/edit-maintenance-assignment/${vehicleId}/${maintenanceId}/${assignmentId}?from=vehicle`
                    );
                  }}
                >
                  <PencilIcon />
                </span>
              )}
              showTableHeader={true}
              headerTitle="Mantenimiento de Vehículo"
              maxWidth="900px"
              tableWidth="900px"
              showAddButton={true}
              addButtonText="+ Agregar mantenimiento"
              onAddButtonClick={() =>
                navigate(`/vehicle-maintenance-assignment/${vehicleId}`)
              }
            />

            <Table<any>
              getRows={async (_pagination) => {
                try {
                  const response = await getMaintenanceRecordsByVehicle(
                    vehicleId
                  );
                  if (response.success) {
                    const mapped = (response.data || []).map(
                      (r: any, i: number) => ({
                        id: r.id || `mr-${i}`,
                        ...r,
                      })
                    );
                    return {
                      success: true,
                      data: mapped,
                    };
                  }
                  return {
                    success: false,
                    data: [],
                    message: "Error al obtener registros de mantenimiento",
                  };
                } catch (error) {
                  return {
                    success: false,
                    data: [],
                    message: `Error al obtener registros: ${
                      (error as Error)?.message
                    }`,
                  };
                }
              }}
              columns={maintenanceRecordColumns}
              title=""
              showTableHeader={true}
              headerTitle="Registro de Mantenimiento"
              showAddButton={true}
              addButtonText="+ Agregar Registro"
              onAddButtonClick={() => {
                navigate(`/maintenance-record-register-edit/${vehicleId}`);
              }}
              maxWidth="900px"
              tableWidth="900px"
            />

            <Table<any>
              getRows={getReservationsForTable}
              columns={reservationColumns}
              title=""
              showEditColumn={false}
              editRoute="/reservation/edit"
              showTableHeader={true}
              headerTitle="Reservas del Vehículo"
              showAddButton={true}
              addButtonText="+ Nueva Reserva"
              onAddButtonClick={() =>
                navigate(`/reservation/create?vehicleId=${vehicleId}`)
              }
              maxWidth="900px"
              enableSearch={true}
              searchPlaceholder="Buscar reservas..."
            />
          </>
        )}

        {isCreateMode && (
          <div className="registration-actions">
            <button
              className="table-add-btn"
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
    </>
  );
}
