import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Form from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  createMaintenanceAssignment,
  getMaintenanceAssignmentById,
  updateMaintenanceAssignment,
} from "../../../services/maintenanceAssignments";
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
import "./AssignmentPage.css";

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const isReadOnly = !isNew && !id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [formData, setFormData] = useState({
    kilometersFrequency: 0,
    daysFrequency: 0,
    observations: "",
    instructions: "",
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

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceAssignmentById(id);

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
          });
        } else {
          showError(response.message || "Error al cargar la asignación");
        }
      }, "Error al cargar la asignación");
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isNew, executeLoad, showError]);

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
          ? createMaintenanceAssignment({
              vehicleId: vehicle.id!.toString(),
              maintenanceId: maintenance.id!.toString(),
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
            })
          : updateMaintenanceAssignment(id!, {
              kilometersFrequency: kmFreq > 0 ? kmFreq : 0,
              daysFrequency: daysFreq > 0 ? daysFreq : 0,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
            }),
      `Asignación ${actionText}da exitosamente`,
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asignación..." />;
  }

  const sections: FormSection[] = [
    {
      title: "Vehículo y Mantenimiento",
      layout: "vertical",
      fields: [
        {
          type: "custom",
          key: "vehicle",
          label: "Vehículo",
          render: () => (
            <VehicleEntitySearch
              vehicle={vehicle}
              onVehicleChange={setVehicle}
            />
          ),
          disabled: isReadOnly || !isNew,
        },
        {
          type: "custom",
          key: "maintenance",
          label: "Mantenimiento",
          render: () => (
            <MaintenanceEntitySearch
              maintenance={maintenance}
              onMaintenanceChange={setMaintenance}
            />
          ),
          disabled: isReadOnly || !isNew,
        },
      ],
    },
    {
      title: "Frecuencias",
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
    <div className="assignment-page">
      <Form
        title={
          isNew
            ? "Nueva Asignación de Mantenimiento"
            : "Editar Asignación de Mantenimiento"
        }
        sections={sections}
        buttons={buttons}
        mode="compact"
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
