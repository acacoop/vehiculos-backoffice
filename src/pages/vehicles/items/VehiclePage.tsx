import { useParams } from "react-router-dom";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../../hooks";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "../../../services/vehicles";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { VehicleModelEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { Table, type TableColumn } from "../../../components/Table/table";
import type { VehicleBrand } from "../../../types/vehicleBrand";
import type { VehicleModel } from "../../../types/vehicleModel";
import type { Assignment } from "../../../types/assignment";
import type { AssignmentFilterParams } from "../../../types/assignment";
import type { ApiFindOptions } from "../../../services/common";
import { getAssignments } from "../../../services/assignments";
import { getVehicleResponsibles } from "../../../services/vehicleResponsibles";
import { getMaintenanceAssignments } from "../../../services/maintenanceAssignments";
import { getMaintenanceRecords } from "../../../services/maintenanceRecords";
import { getVehicleKilometersLogs } from "../../../services/kilometers";
import type {
  KilometersFilterParams,
  VehicleKilometersLog,
} from "../../../types/kilometer";
import { getReservations } from "../../../services/reservations";
import type {
  MaintenanceAssignment,
  MaintenanceAssignmentFilterParams,
} from "../../../types/maintenanceAsignment";
import type {
  MaintenanceRecord,
  MaintenanceRecordFilterParams,
} from "../../../types/maintenanceRecord";
import type {
  Reservation,
  ReservationFilterParams,
} from "../../../types/reservation";
import { COLORS } from "../../../common/colors";
import type { VehicleResponsibleFilterParams } from "../../../types/vehicleResponsible";

export default function VehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [model, setModel] = useState<VehicleModel | null>(null);

  const [formData, setFormData] = useState({
    licensePlate: "",
    year: new Date().getFullYear(),
    chassisNumber: "",
    engineNumber: "",
    transmission: "",
    fuelType: "",
  });

  const {
    loading,
    saving,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({ redirectOnSuccess: "/vehicles" });

  useEffect(() => {
    if (!isNew && id) {
      loadVehicle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Clear model when brand changes (unless loading a vehicle)
  useEffect(() => {
    if (brand && model && model.brand?.id !== brand.id) {
      setModel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  const loadVehicle = async (vehicleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleById(vehicleId);

      if (response.success && response.data) {
        setFormData({
          licensePlate: response.data.licensePlate || "",
          year: response.data.year || new Date().getFullYear(),
          chassisNumber: response.data.chassisNumber || "",
          engineNumber: response.data.engineNumber || "",
          transmission: response.data.transmission || "",
          fuelType: response.data.fuelType || "",
        });

        // Set brand and model from the loaded vehicle
        if (response.data.model) {
          setModel(response.data.model);
          if (response.data.model.brand) {
            setBrand(response.data.model.brand);
          }
        }
      } else {
        showError(response.message || "Error al cargar el vehículo");
      }
    }, "Error al cargar el vehículo");
  };

  const handleSave = () => {
    if (!formData.licensePlate) {
      showError("La patente es obligatoria");
      return;
    }

    if (!model) {
      showError("El modelo es obligatorio");
      return;
    }

    if (!formData.year) {
      showError("El año es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} este vehículo?`,
      () =>
        isNew
          ? createVehicle({
              licensePlate: formData.licensePlate,
              modelId: model!.id,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
            })
          : updateVehicle(id!, {
              licensePlate: formData.licensePlate,
              modelId: model!.id,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
              fuelType: formData.fuelType || undefined,
            }),
      `Vehículo ${actionText}do con éxito`
    );
  };

  // ============ TABLE COLUMNS ============
  const assignmentColumns: TableColumn<Assignment>[] = [
    { field: "user.cuit", headerName: "CUIT", minWidth: 110 },
    { field: "user.lastName", headerName: "Apellido", minWidth: 150 },
    { field: "user.firstName", headerName: "Nombre", minWidth: 150 },
    {
      field: "startDate",
      headerName: "Fecha Desde",
      minWidth: 130,
      type: "date",
    },
    {
      field: "endDate",
      headerName: "Fecha Hasta",
      minWidth: 130,
      type: "enddate",
    },
  ];

  const maintenanceColumns: TableColumn<MaintenanceAssignment>[] = [
    {
      field: "maintenance.category.name",
      headerName: "Categoría Mantenimiento",
      minWidth: 250,
    },
    {
      field: "maintenance.name",
      headerName: "Nombre de Mantenimiento",
      minWidth: 300,
    },
    {
      field: "daysFrequency",
      headerName: "Frecuencia (Días)",
      minWidth: 150,
      transform: (value, row) => {
        const days = Number(value) || row.maintenance.daysFrequency;
        return days && days > 0 ? `${days} días` : "N/A";
      },
    },
    {
      field: "kilometersFrequency",
      headerName: "Frecuencia (KM)",
      minWidth: 150,
      transform: (value, row) => {
        const km = Number(value) || row.maintenance.kilometersFrequency;
        return km && km > 0 ? `${km} km` : "N/A";
      },
    },
  ];

  const maintenanceRecordColumns: TableColumn<MaintenanceRecord>[] = [
    {
      field: "date",
      headerName: "Fecha",
      minWidth: 150,
      type: "date",
    },
    {
      field: "kilometers",
      headerName: "Kilómetros",
      minWidth: 150,
      transform: (value) => (value ? `${value} km` : "N/A"),
    },
    {
      field: "notes",
      headerName: "Observaciones",
      minWidth: 300,
      transform: (value) => value || "Sin observaciones",
    },
  ];

  const kilometersColumns: TableColumn<VehicleKilometersLog>[] = [
    {
      field: "date",
      headerName: "Fecha de Registro",
      minWidth: 180,
      type: "date",
    },
    {
      field: "kilometers",
      headerName: "Kilometraje",
      minWidth: 150,
      transform: (value) => (value ? `${value} km` : "N/A"),
    },
    {
      field: "user.id",
      headerName: "Registrado por",
      minWidth: 180,
      transform: (value, row) => {
        if (row.user) {
          return `${row.user.firstName} ${row.user.lastName}`;
        }
        return value || "N/A";
      },
    },
  ];

  const reservationColumns: TableColumn<Reservation>[] = [
    {
      field: "user.id",
      headerName: "Usuario",
      minWidth: 200,
      transform: (value, row) => {
        if (row.user) {
          return `${row.user.firstName} ${row.user.lastName}`;
        }
        return value || "N/A";
      },
    },
    {
      field: "startDate",
      headerName: "Fecha y Hora Inicio",
      minWidth: 180,
      type: "datetime",
    },
    {
      field: "endDate",
      headerName: "Fecha y Hora Fin",
      minWidth: 180,
      type: "datetime",
    },
    {
      field: "status",
      headerName: "Estado",
      minWidth: 120,
      transform: (_value, row) => {
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
      color: (_value, row) => {
        const now = new Date();
        const startDate = new Date(row.startDate);
        const endDate = new Date(row.endDate);

        if (now < startDate) {
          return COLORS.warning; // Programada - Naranja
        } else if (now >= startDate && now <= endDate) {
          return COLORS.success; // Activa - Verde
        } else {
          return COLORS.default; // Finalizada - Gris
        }
      },
    },
  ];

  const vehicleInfoSections: FormSection[] = [
    {
      type: "fields",
      title: "Información General",
      fields: [
        {
          type: "text",
          value: formData.licensePlate,
          onChange: (value: string) =>
            setFormData({ ...formData, licensePlate: value }),
          key: "licensePlate",
          label: "Patente",
          required: true,
        },
        {
          type: "number",
          value: formData.year,
          onChange: (value: number) =>
            setFormData({ ...formData, year: value }),
          key: "year",
          label: "Año",
          required: true,
        },
      ],
    },
    {
      type: "entity",
      render: (
        <VehicleModelEntitySearch model={model} onModelChange={setModel} />
      ),
    },
    {
      type: "fields",
      title: "Ficha Técnica",
      fields: [
        {
          type: "text",
          value: formData.chassisNumber,
          onChange: (value: string) =>
            setFormData({ ...formData, chassisNumber: value }),
          key: "chassisNumber",
          label: "Número de Chasis",
        },
        {
          type: "text",
          value: formData.engineNumber,
          onChange: (value: string) =>
            setFormData({ ...formData, engineNumber: value }),
          key: "engineNumber",
          label: "Número de Motor",
        },
        {
          type: "text",
          value: formData.transmission,
          onChange: (value: string) =>
            setFormData({ ...formData, transmission: value }),
          key: "transmission",
          label: "Transmisión",
        },
        {
          type: "text",
          value: formData.fuelType,
          onChange: (value: string) =>
            setFormData({ ...formData, fuelType: value }),
          key: "fuelType",
          label: "Tipo de Combustible",
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/vehicles/brands"),
      disabled: saving,
    },
    {
      text: saving
        ? "Guardando..."
        : isNew
        ? "Crear Marca"
        : "Actualizar Marca",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando vehículo..." />;
  }

  return (
    <div>
      <div>
        <Form
          title="Detalle del Vehículo"
          sections={vehicleInfoSections}
          buttons={buttons}
        />
      </div>

      {!isNew && id && (
        <>
          <Table
            getRows={(findOptions: ApiFindOptions<AssignmentFilterParams>) =>
              getAssignments({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  vehicleId: id,
                },
              })
            }
            columns={assignmentColumns}
            header={{ title: "Asignaciones" }}
            search={{ enabled: true, placeholder: "Buscar asignaciones..." }}
          />

          <Table
            getRows={(
              findOptions: ApiFindOptions<VehicleResponsibleFilterParams>,
            ) =>
              getVehicleResponsibles({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  vehicleId: id,
                },
              })
            }
            columns={assignmentColumns}
            header={{ title: "Responsables" }}
            search={{ enabled: true, placeholder: "Buscar responsables..." }}
          />

          <Table
            getRows={(findOptions: ApiFindOptions<KilometersFilterParams>) =>
              getVehicleKilometersLogs(id, findOptions)
            }
            columns={kilometersColumns}
            header={{ title: "Historial de Kilometraje" }}
            search={{ enabled: true, placeholder: "Buscar registros..." }}
          />

          <Table
            getRows={(
              findOptions: ApiFindOptions<MaintenanceAssignmentFilterParams>,
            ) =>
              getMaintenanceAssignments({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  vehicleId: id,
                },
              })
            }
            columns={maintenanceColumns}
            header={{ title: "Mantenimientos Programados" }}
            search={{ enabled: true, placeholder: "Buscar mantenimientos..." }}
          />

          <Table
            getRows={(
              findOptions: ApiFindOptions<MaintenanceRecordFilterParams>,
            ) =>
              getMaintenanceRecords({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  vehicleId: id,
                },
              })
            }
            columns={maintenanceRecordColumns}
            header={{ title: "Registro de Mantenimientos" }}
            search={{ enabled: true, placeholder: "Buscar registros..." }}
          />

          <Table
            getRows={(findOptions: ApiFindOptions<ReservationFilterParams>) =>
              getReservations({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  vehicleId: id,
                },
              })
            }
            columns={reservationColumns}
            header={{ title: "Reservas" }}
            search={{ enabled: true, placeholder: "Buscar reservas..." }}
          />
        </>
      )}

      <ConfirmDialog
        open={isDialogOpen}
        message={dialogMessage}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </div>
  );
}
