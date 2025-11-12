import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Form from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { getVehicleById } from "../../../services/vehicles";
import { getMaintenanceById } from "../../../services/maintenances";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import {
  VehicleEntitySearch,
  MaintenanceEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import type { Vehicle } from "../../../types/vehicle";
import type { Maintenance } from "../../../types/maintenance";
import type { FormSection, FormButton } from "../../../components/Form/Form";
import { Table } from "../../../components/Table/table";
import { getMaintenanceRecords } from "../../../services/maintenanceRecords";
import type { MaintenanceRecordFilterParams } from "../../../types/maintenanceRecord";
import type { ApiFindOptions } from "../../../services/common";
import {
  createMaintenanceRequirement,
  deleteMaintenanceRequirement,
  getMaintenanceRequirementById,
  updateMaintenanceRequirement,
} from "../../../services/maintenaceRequirements";

export default function MaintenanceRequirementPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");
  const isReadOnly = !isNew && !id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [formData, setFormData] = useState({
    kilometersFrequency: 0,
    daysFrequency: 0,
    observations: "",
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isIndefinite: true,
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
  } = usePageState({ redirectOnSuccess: "/maintenance/assignments" });
  const navigate = useNavigate();

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceRequirementById(id);

        if (cancelled) return;

        if (response.success && response.data) {
          const assignment = response.data;
          setVehicle(assignment.vehicle || null);
          setMaintenance(assignment.maintenance || null);
          setFormData({
            kilometersFrequency: assignment.kilometersFrequency || 0,
            daysFrequency: assignment.daysFrequency || 0,
            observations: assignment.observations || "",
            instructions: assignment.instructions || "",
            startDate: assignment.startDate || "",
            endDate: assignment.endDate || "",
            isIndefinite: !assignment.endDate,
          });
        } else {
          showError(response.message || "Error al cargar la asignación");
        }
      }, "Error al cargar la asignación");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load vehicle from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const vehicleId = searchParams.get("vehicleId");

    if (vehicleId) {
      executeLoad(async () => {
        const response = await getVehicleById(vehicleId);
        if (response.success && response.data) {
          setVehicle(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Load maintenance from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const maintenanceId = searchParams.get("maintenanceId");

    if (maintenanceId) {
      executeLoad(async () => {
        const response = await getMaintenanceById(maintenanceId);
        if (response.success && response.data) {
          setMaintenance(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Load frecuencies when maintenance changes
  useEffect(() => {
    if (!maintenance) return;

    setFormData((prevData) => ({
      ...prevData,
      kilometersFrequency: maintenance.kilometersFrequency || 0,
      daysFrequency: maintenance.daysFrequency || 0,
      instructions: maintenance.instructions || "",
      observations: maintenance.observations || "",
    }));
  }, [maintenance]);

  const handleSave = () => {
    if (!vehicle) {
      showError("El vehículo es obligatorio");
      return;
    }

    if (!maintenance) {
      showError("El mantenimiento es obligatorio");
      return;
    }

    const kmFreq = formData.kilometersFrequency;
    const daysFreq = formData.daysFrequency;

    if (kmFreq <= 0 && daysFreq <= 0) {
      showError("Debe especificar al menos una frecuencia (kilómetros o días)");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} esta asignación?`,
      () =>
        isNew
          ? createMaintenanceRequirement({
              vehicleId: vehicle.id!.toString(),
              maintenanceId: maintenance.id!.toString(),
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
              startDate: new Date(
                formData.startDate + "T00:00:00.000Z",
              ).toISOString(),
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : new Date(formData.endDate + "T23:59:59.000Z").toISOString(),
            })
          : updateMaintenanceRequirement(id!, {
              kilometersFrequency: kmFreq > 0 ? kmFreq : 0,
              daysFrequency: daysFreq > 0 ? daysFreq : 0,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
              startDate: new Date(
                formData.startDate + "T00:00:00.000Z",
              ).toISOString(),
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : new Date(formData.endDate + "T23:59:59.000Z").toISOString(),
            }),
      `Asignación ${actionText}da exitosamente`,
    );
  };

  const handleDelete = async () => {
    executeSave(
      "Borrar esta asignación también eliminará todos sus registros de mantenimiento asociados. ¿Está seguro que desea continuar?",
      () => deleteMaintenanceRequirement(id!),
      "Asignación eliminada exitosamente",
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asignación..." />;
  }

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <VehicleEntitySearch
          entity={vehicle}
          onEntityChange={setVehicle}
          disabled={!isNew}
        />
      ),
    },
    {
      type: "entity",
      render: (
        <MaintenanceEntitySearch
          entity={maintenance}
          onEntityChange={setMaintenance}
          disabled={!isNew}
        />
      ),
    },
    {
      type: "fields",
      title: "Frecuencias (Debe especificar al menos una)",
      layout: "horizontal",
      fields: [
        {
          type: "number",
          key: "kilometersFrequency",
          label: "Frecuencia en Kilómetros",
          value: formData.kilometersFrequency,
          onChange: (value) =>
            setFormData({
              ...formData,
              kilometersFrequency: Number(value) || 0,
            }),
          placeholder: "Ingrese frecuencia en kilómetros",
          min: 0,
          disabled: isReadOnly,
        },
        {
          type: "number",
          key: "daysFrequency",
          label: "Frecuencia en Días",
          value: formData.daysFrequency,
          onChange: (value) =>
            setFormData({ ...formData, daysFrequency: Number(value) || 0 }),
          placeholder: "Ingrese frecuencia en días",
          min: 0,
          disabled: isReadOnly,
        },
      ],
    },
    {
      type: "fields",
      title: "Período",
      fields: [
        {
          type: "date",
          value: formData.startDate,
          onChange: (value: string) =>
            setFormData({ ...formData, startDate: value }),
          key: "startDate",
          label: "Fecha Desde",
          required: true,
        },
        {
          type: "checkbox",
          value: formData.isIndefinite,
          onChange: (value: boolean) =>
            setFormData({ ...formData, isIndefinite: value }),
          key: "isIndefinite",
          label: "Asignación indefinida (sin fecha de fin)",
        },
        {
          type: "date",
          value: formData.endDate,
          onChange: (value: string) =>
            setFormData({ ...formData, endDate: value }),
          key: "endDate",
          label: "Fecha Hasta",
          show: !formData.isIndefinite,
          min: formData.startDate,
        },
      ],
    },
    {
      type: "fields",
      title: "Información Adicional",
      layout: "vertical",
      fields: [
        {
          type: "textarea",
          key: "observations",
          label: "Observaciones",
          value: formData.observations,
          onChange: (value) =>
            setFormData({ ...formData, observations: value }),
          placeholder: "Observaciones adicionales...",
          rows: 3,
          disabled: isReadOnly,
        },
        {
          type: "textarea",
          key: "instructions",
          label: "Instrucciones",
          value: formData.instructions,
          onChange: (value) =>
            setFormData({ ...formData, instructions: value }),
          placeholder: "Instrucciones para el mantenimiento...",
          rows: 3,
          disabled: isReadOnly,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/assignments"),
      disabled: saving,
    },
    ...(!isNew
      ? [
          {
            text: saving ? "Eliminando..." : "Eliminar Asignación",
            variant: "danger" as const,
            onClick: handleDelete,
            disabled: saving,
            loading: saving,
          },
        ]
      : []),
    ...(!isReadOnly
      ? [
          {
            text: saving
              ? "Guardando..."
              : isNew
              ? "Crear Asignación"
              : "Actualizar Asignación",
            variant: "primary" as const,
            onClick: handleSave,
            disabled: saving,
            loading: saving,
          },
        ]
      : []),
  ];

  return (
    <div className="container">
      <Form
        title={
          isNew
            ? "Nueva Asignación de Mantenimiento"
            : "Editar Asignación de Mantenimiento"
        }
        sections={sections}
        buttons={buttons}
      />

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

      {!isNew && (
        <Table
          getRows={(
            findOptions: ApiFindOptions<MaintenanceRecordFilterParams>,
          ) =>
            getMaintenanceRecords({
              ...findOptions,
              filters: {
                ...findOptions?.filters,
                maintenanceId: maintenance?.id!.toString(),
                vehicleId: vehicle?.id!.toString(),
              },
            })
          }
          columns={[
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
              transform: (v: unknown) => (v ? `${v} km` : "N/A"),
            },
            {
              field: "notes",
              headerName: "Observaciones",
              minWidth: 300,
              transform: (v: unknown) => (v ? String(v) : "Sin observaciones"),
            },
          ]}
          header={{
            title: "Registros de Mantenimiento",
            addButton: {
              text: "+ Nuevo Registro",
              onClick: () =>
                navigate(
                  `/maintenance/records/new?maintenanceId=${maintenance?.id}&vehicleId=${vehicle?.id}`,
                ),
            },
          }}
          search={{ enabled: true, placeholder: "Buscar registros..." }}
        />
      )}
    </div>
  );
}
