import { useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { Form, type FormSection } from "../../../components/Form";
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
import { Table, type TableColumn } from "../../../components/Table";
import { TableSelector } from "../../../components/TableSelector";
import type { VehicleModel } from "../../../types/vehicleModel";
import type { Vehicle } from "../../../types/vehicle";
import type { Assignment } from "../../../types/assignment";
import { getAssignments } from "../../../services/assignments";
import { getVehicleResponsibles } from "../../../services/vehicleResponsibles";
import { getMaintenanceRecords } from "../../../services/maintenanceRecords";
import { getVehicleKilometersLogs } from "../../../services/kilometers";
import type { VehicleKilometersLog } from "../../../types/kilometer";
import { getReservations } from "../../../services/reservations";
import type { MaintenanceRecord } from "../../../types/maintenanceRecord";
import type { Reservation } from "../../../types/reservation";
import { COLORS } from "../../../common/colors";
import { QUARTER_LABELS } from "../../../common";
import { TRANSMISSION_TYPES, FUEL_TYPES } from "../../../common/constants";
import { getQuarterlyControls } from "../../../services/quarterlyControls";
import type { QuarterlyControl } from "../../../types/quarterlyControl";
import { getQuarterlyControlStatus } from "../../../common/utils";
import {
  Users,
  UserCheck,
  Gauge,
  Wrench,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import { ROUTES } from "../../../common";

const emptyVehicle: Partial<Vehicle> = {
  year: new Date().getFullYear(),
  registrationDate: new Date().toISOString().split("T")[0],
};

export default function VehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [vehicle, setVehicle] = useState<Partial<Vehicle>>(emptyVehicle);

  const {
    loading,
    saving,
    isEditing,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    goToWithData,
    enableEdit,
    cancelEdit,
    cancelCreate,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState<Partial<Vehicle>>({
    redirectOnSuccess: "/vehicles",
    startInViewMode: !isNew,
    scope: "vehicle",
    defaultFormState: emptyVehicle,
    onInitialData: setVehicle,
  });

  useEffect(() => {
    // Only load existing vehicle data (new entities handled via onInitialData)
    if (!isNew && id) {
      loadVehicle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadVehicle = async (vehicleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleById(vehicleId);

      if (response.success && response.data) {
        setVehicle(response.data);
        setOriginalData(response.data);
      } else {
        showError(response.message || "Error al cargar el vehículo");
      }
    }, "Error al cargar el vehículo");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles");
    } else {
      const original = cancelEdit<Partial<Vehicle>>();
      if (original) {
        setVehicle(original);
      }
    }
  };

  const handleModelChange = (model: VehicleModel | null) => {
    setVehicle({ ...vehicle, model: model || undefined });
  };

  const handleSave = () => {
    if (!vehicle.licensePlate) {
      showError("La patente es obligatoria");
      return;
    }

    if (!vehicle.model) {
      showError("El modelo es obligatorio");
      return;
    }

    if (!vehicle.year) {
      showError("El año es obligatorio");
      return;
    }

    if (!vehicle.registrationDate) {
      showError("La fecha de alta es obligatoria");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    const statusText = isNew ? "creado" : "actualizado";

    executeSave(
      `¿Está seguro que desea ${actionText} este vehículo?`,
      () => {
        const payload = {
          licensePlate: vehicle.licensePlate!,
          modelId: vehicle.model!.id,
          year: vehicle.year!,
          chassisNumber: vehicle.chassisNumber || undefined,
          engineNumber: vehicle.engineNumber || undefined,
          transmission: vehicle.transmission || undefined,
          fuelType: vehicle.fuelType || undefined,
          registrationDate: vehicle.registrationDate!,
        };

        return isNew ? createVehicle(payload) : updateVehicle(id!, payload);
      },
      `Vehículo ${statusText} con éxito`,
      {
        isCreate: isNew,
        entityRoute: "/vehicles",
      },
    );
  };

  // ============ TABLE COLUMNS ============
  const assignmentColumns: TableColumn<Assignment>[] = [
    { field: "user.cuit", headerName: "CUIT", minWidth: 110 },
    { field: "user.lastName", headerName: "Apellido", minWidth: 150 },
    { field: "user.firstName", headerName: "Nombre", minWidth: 150 },
    {
      field: "startDate",
      headerName: "Fecha desde",
      minWidth: 130,
      type: "date",
    },
    {
      field: "endDate",
      headerName: "Fecha hasta",
      minWidth: 130,
      type: "enddate",
    },
  ];

  const maintenanceRecordColumns: TableColumn<MaintenanceRecord>[] = [
    {
      field: "maintenance.name",
      headerName: "Mantenimiento",
      minWidth: 200,
      type: "text",
    },
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

  const quarterlyControlColumns: TableColumn<QuarterlyControl>[] = [
    {
      field: "year",
      headerName: "Período",
      minWidth: 100,
      transform: (value, row) => {
        return `${value} ${QUARTER_LABELS[Number(row.quarter)] || row.quarter}`;
      },
    },
    {
      field: "filledBy",
      headerName: "Completado por",
      minWidth: 180,
      transform: (_value, row) => {
        const user = row.filledBy;
        if (user) {
          return `${user.firstName} ${user.lastName}`;
        }
        return "No completado";
      },
    },
    {
      field: "filledAt",
      headerName: "Fecha de completado",
      minWidth: 140,
      type: "date",
      transform: (value) => value || "No completado",
    },
    {
      field: "hasFailedItems",
      headerName: "Estado",
      minWidth: 180,
      transform: (_value, row) => {
        const { label } = getQuarterlyControlStatus(row);
        return label;
      },
      color: (_value, row) => {
        const { color } = getQuarterlyControlStatus(row);
        return color;
      },
    },
  ];

  const vehicleInfoSections: FormSection[] = [
    {
      type: "fields",
      title: "Información General",
      layout: "grid",
      fields: [
        {
          type: "text",
          value: vehicle.licensePlate,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, licensePlate: value }),
          key: "licensePlate",
          label: "Patente",
          required: true,
        },
        {
          type: "number",
          value: vehicle.year,
          onChange: (value: number) => setVehicle({ ...vehicle, year: value }),
          key: "year",
          label: "Año",
          required: true,
        },
        {
          type: "datetime",
          value: vehicle.registrationDate,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, registrationDate: value }),
          key: "registrationDate",
          label: "Fecha de Alta",
          required: true,
          span: 2,
        },
      ],
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleModelEntitySearch
          entity={vehicle.model || null}
          onEntityChange={handleModelChange}
          disabled={disabled}
          contextScope="vehicle"
          getFormData={() => vehicle}
        />
      ),
    },
    {
      type: "fields",
      title: "Ficha técnica",
      layout: "grid",
      fields: [
        {
          type: "text",
          value: vehicle.chassisNumber,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, chassisNumber: value }),
          key: "chassisNumber",
          label: "Número de Chasis",
        },
        {
          type: "text",
          value: vehicle.engineNumber,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, engineNumber: value }),
          key: "engineNumber",
          label: "Número de Motor",
        },
        {
          type: "select",
          value: vehicle.transmission,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, transmission: value }),
          key: "transmission",
          label: "Transmisión",
          required: false,
          placeholder: "Seleccione una transmisión",
          options: TRANSMISSION_TYPES.map((type) => ({
            value: type,
            label: type,
          })),
        },
        {
          type: "select",
          value: vehicle.fuelType,
          onChange: (value: string) =>
            setVehicle({ ...vehicle, fuelType: value }),
          key: "fuelType",
          label: "Tipo de Combustible",
          required: false,
          placeholder: "Seleccione un tipo de combustible",
          options: FUEL_TYPES.map((type) => ({
            value: type,
            label: type,
          })),
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando vehículo..." />;
  }

  const vehicleLabel = vehicle.licensePlate || "Nuevo vehículo";

  const breadcrumbItems = [
    { label: "Inicio", href: ROUTES.HOME },
    { label: "Vehículos", href: ROUTES.VEHICLES },
    { label: vehicleLabel },
  ];

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        backButton={{
          text: "Volver",
          fallbackHref: ROUTES.VEHICLES,
        }}
      />
      <Form
        title="Detalle del vehículo"
        sections={vehicleInfoSections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          saving,
          entityName: "Vehículo",
        }}
      />

      {!isNew && id && (
        <TableSelector
          tabs={[
            {
              id: "assignments",
              label: "Asignaciones",
              icon: Users,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getAssignments({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={assignmentColumns}
                  header={{
                    title: "Asignaciones",
                    addButton: {
                      text: "+ Agregar asignación",
                      onClick: () =>
                        goToWithData("/vehicles/assignments/new", { vehicle }),
                    },
                  }}
                  search={{
                    enabled: true,
                    placeholder: "Buscar asignaciones...",
                  }}
                  minHeight="500px"
                />
              ),
            },
            {
              id: "responsibles",
              label: "Responsables",
              icon: UserCheck,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getVehicleResponsibles({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={assignmentColumns}
                  header={{
                    title: "Responsables",
                    addButton: {
                      text: "+ Agregar responsable",
                      onClick: () =>
                        goToWithData("/vehicles/responsibles/new", { vehicle }),
                    },
                  }}
                  actionColumn={{
                    route: "/vehicles/responsibles",
                  }}
                  search={{
                    enabled: true,
                    placeholder: "Buscar responsables...",
                  }}
                  minHeight="500px"
                />
              ),
            },
            {
              id: "kilometers",
              label: "Kilometraje",
              icon: Gauge,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getVehicleKilometersLogs({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={kilometersColumns}
                  header={{
                    title: "Historial de kilometraje",
                    addButton: {
                      text: "+ Nuevo registro",
                      onClick: () =>
                        goToWithData("/vehicles/kilometersLogs/new", {
                          vehicle,
                        }),
                    },
                  }}
                  actionColumn={{
                    route: "/vehicles/kilometersLogs",
                  }}
                  search={{ enabled: true, placeholder: "Buscar registros..." }}
                />
              ),
            },
            {
              id: "maintenance",
              label: "Mantenimientos",
              icon: Wrench,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getMaintenanceRecords({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={maintenanceRecordColumns}
                  header={{
                    title: "Registro de mantenimientos",
                    addButton: {
                      text: "+ Nuevo registro",
                      onClick: () =>
                        goToWithData("/maintenance/records/new", { vehicle }),
                    },
                  }}
                  actionColumn={{
                    route: "/maintenance/records",
                  }}
                  search={{ enabled: true, placeholder: "Buscar registros..." }}
                  minHeight="500px"
                />
              ),
            },
            {
              id: "reservations",
              label: "Reservas",
              icon: CalendarDays,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getReservations({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={reservationColumns}
                  header={{
                    title: "Reservas",
                    addButton: {
                      text: "+ Nueva reserva",
                      onClick: () =>
                        goToWithData("/reservations/new", { vehicle }),
                    },
                  }}
                  actionColumn={{
                    route: "/reservations",
                  }}
                  search={{ enabled: true, placeholder: "Buscar reservas..." }}
                  minHeight="500px"
                />
              ),
            },
            {
              id: "quarterlyControls",
              label: "Controles Trimestrales",
              icon: ClipboardCheck,
              table: (
                <Table
                  getRows={(findOptions) =>
                    getQuarterlyControls({
                      ...findOptions,
                      filters: {
                        ...findOptions.filters,
                        vehicleId: id,
                      },
                    })
                  }
                  columns={quarterlyControlColumns}
                  header={{
                    title: "Controles trimestrales",
                  }}
                  actionColumn={{
                    route: "/quarterly-controls",
                  }}
                  search={{ enabled: true, placeholder: "Buscar controles..." }}
                  minHeight="500px"
                />
              ),
            },
          ]}
        />
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
