import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Form from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { getVehicleModelById } from "../../../services/vehicleModels";
import { getMaintenanceById } from "../../../services/maintenances";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import {
  VehicleModelEntitySearch,
  MaintenanceEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import type { VehicleModel } from "../../../types/vehicleModel";
import type { Maintenance } from "../../../types/maintenance";
import type { FormSection, FormButton } from "../../../components/Form/Form";
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

  const [model, setModel] = useState<VehicleModel | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [formData, setFormData] = useState({
    kilometersFrequency: 0,
    daysFrequency: 0,
    observations: "",
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isIndefinite: true,
    useKilometers: false,
    useDays: false,
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
  } = usePageState({ redirectOnSuccess: "/maintenance/requirements" });

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceRequirementById(id);

        if (cancelled) return;

        if (response.success && response.data) {
          const assignment = response.data;
          setModel(assignment.model || null);
          setMaintenance(assignment.maintenance || null);
          setFormData({
            kilometersFrequency: assignment.kilometersFrequency || 0,
            daysFrequency: assignment.daysFrequency || 0,
            observations: assignment.observations || "",
            instructions: assignment.instructions || "",
            startDate: assignment.startDate || "",
            endDate: assignment.endDate || "",
            isIndefinite: !assignment.endDate,
            useKilometers:
              !!assignment.kilometersFrequency &&
              assignment.kilometersFrequency > 0,
            useDays: !!assignment.daysFrequency && assignment.daysFrequency > 0,
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

  // Load model from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const modelId = searchParams.get("modelId");

    if (modelId) {
      executeLoad(async () => {
        const response = await getVehicleModelById(modelId);
        if (response.success && response.data) {
          setModel(response.data);
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
    if (!isNew) return;

    const hasKm =
      maintenance?.kilometersFrequency && maintenance.kilometersFrequency > 0;
    const hasDays = maintenance?.daysFrequency && maintenance.daysFrequency > 0;

    setFormData((prevData) => ({
      ...prevData,
      kilometersFrequency: maintenance?.kilometersFrequency || 0,
      daysFrequency: maintenance?.daysFrequency || 0,
      instructions: maintenance?.instructions || "",
      observations: maintenance?.observations || "",
      useKilometers: !!hasKm,
      useDays: !!hasDays,
    }));
  }, [maintenance, isNew]);

  const handleSave = () => {
    if (!model) {
      showError("El modelo es obligatorio");
      return;
    }

    if (!maintenance) {
      showError("El mantenimiento es obligatorio");
      return;
    }

    const kmFreq = formData.useKilometers ? formData.kilometersFrequency : 0;
    const daysFreq = formData.useDays ? formData.daysFrequency : 0;

    if (kmFreq <= 0 && daysFreq <= 0) {
      showError(
        "Debe especificar al menos una frecuencia válida (kilómetros > 0 o días > 0)",
      );
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este requerimiento de mantenimiento?`,
      () =>
        isNew
          ? createMaintenanceRequirement({
              modelId: model.id!.toString(),
              maintenanceId: maintenance.id!.toString(),
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
              startDate: formData.startDate,
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : formData.endDate,
            })
          : updateMaintenanceRequirement(id!, {
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
              startDate: formData.startDate,
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : formData.endDate,
            }),
      `Requerimiento ${actionText}do exitosamente`,
    );
  };

  const handleDelete = async () => {
    executeSave(
      "¿Está seguro que desea eliminar este requerimiento de mantenimiento?",
      () => deleteMaintenanceRequirement(id!),
      "Requerimiento eliminado exitosamente",
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando requerimiento..." />;
  }

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <VehicleModelEntitySearch
          entity={model}
          onEntityChange={setModel}
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
      layout: "vertical",
      fields: [
        {
          type: "checkbox",
          value: formData.useKilometers,
          onChange: (value: boolean) =>
            setFormData({ ...formData, useKilometers: value }),
          key: "useKilometers",
          label: "Especificar frecuencia por kilómetros",
          disabled: isReadOnly,
        },
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
          min: 1,
          disabled: isReadOnly,
          show: formData.useKilometers,
        },
        {
          type: "checkbox",
          value: formData.useDays,
          onChange: (value: boolean) =>
            setFormData({ ...formData, useDays: value }),
          key: "useDays",
          label: "Especificar frecuencia por días",
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
          min: 1,
          disabled: isReadOnly,
          show: formData.useDays,
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
      onClick: () => goTo("/maintenance/requirements"),
      disabled: saving,
    },
    ...(!isNew
      ? [
          {
            text: saving ? "Eliminando..." : "Eliminar Requerimiento",
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
              ? "Crear Requerimiento"
              : "Actualizar Requerimiento",
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
            ? "Nuevo Requerimiento de Mantenimiento"
            : "Editar Requerimiento de Mantenimiento"
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
    </div>
  );
}
