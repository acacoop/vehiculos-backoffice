import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import Form from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { toInputDate, inputDateToISO } from "../../../common/date";
import {
  VehicleModelEntitySearch,
  MaintenanceEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";

import type { MaintenanceRequirement } from "../../../types/maintenanceRequirement";
import type { FormSection } from "../../../components/Form/Form";
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

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<MaintenanceRequirement>>(
    {},
  );

  // UI-only checkbox states
  const [useKilometers, setUseKilometers] = useState(false);
  const [useDays, setUseDays] = useState(false);
  const [isIndefinite, setIsIndefinite] = useState(true);

  // Handler for initial data
  const handleInitialData = useCallback(
    (data: Partial<MaintenanceRequirement>) => {
      setFormState(data);
      setUseKilometers(!!data.kilometersFrequency);
      setUseDays(!!data.daysFrequency);
      setIsIndefinite(!data.endDate);
    },
    [],
  );

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
    enableEdit,
    cancelEdit,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
    cancelCreate,
  } = usePageState<Partial<MaintenanceRequirement>>({
    redirectOnSuccess: "/maintenance/requirements",
    startInViewMode: !isNew,
    scope: "maintenanceRequirement",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing requirement (new entities handled via onInitialData)
    if (!isNew && id) {
      let cancelled = false;

      (async () => {
        await executeLoad(async () => {
          const response = await getMaintenanceRequirementById(id);

          if (cancelled) return;

          if (response.success && response.data) {
            const data = response.data;
            setFormState(data);
            setUseKilometers(
              !!data.kilometersFrequency && data.kilometersFrequency > 0,
            );
            setUseDays(!!data.daysFrequency && data.daysFrequency > 0);
            setIsIndefinite(!data.endDate);
            setOriginalData({
              formState: data,
              useKilometers:
                !!data.kilometersFrequency && data.kilometersFrequency > 0,
              useDays: !!data.daysFrequency && data.daysFrequency > 0,
              isIndefinite: !data.endDate,
            });
          } else {
            showError(response.message || "Error al cargar la asignación");
          }
        }, "Error al cargar la asignación");
      })();

      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load frequencies when maintenance changes
  useEffect(() => {
    if (!isNew || !formState.maintenance) return;

    const m = formState.maintenance;
    const hasKm = m.kilometersFrequency && m.kilometersFrequency > 0;
    const hasDays = m.daysFrequency && m.daysFrequency > 0;

    setFormState((prev) => ({
      ...prev,
      kilometersFrequency: m.kilometersFrequency || undefined,
      daysFrequency: m.daysFrequency || undefined,
      instructions: m.instructions || undefined,
      observations: m.observations || undefined,
    }));
    setUseKilometers(!!hasKm);
    setUseDays(!!hasDays);
  }, [formState.maintenance, isNew]);

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/maintenance/requirements");
    } else {
      const original = cancelEdit<{
        formState: Partial<MaintenanceRequirement>;
        useKilometers: boolean;
        useDays: boolean;
        isIndefinite: boolean;
      }>();
      if (original) {
        setFormState(original.formState);
        setUseKilometers(original.useKilometers);
        setUseDays(original.useDays);
        setIsIndefinite(original.isIndefinite);
      }
    }
  };

  const handleSave = () => {
    if (!formState.model) {
      showError("El modelo es obligatorio");
      return;
    }

    if (!formState.maintenance) {
      showError("El mantenimiento es obligatorio");
      return;
    }

    const kmFreq = useKilometers ? formState.kilometersFrequency || 0 : 0;
    const daysFreq = useDays ? formState.daysFrequency || 0 : 0;

    if (kmFreq <= 0 && daysFreq <= 0) {
      showError(
        "Debe especificar al menos una frecuencia válida (kilómetros > 0 o días > 0)",
      );
      return;
    }

    const startDate = formState.startDate
      ? inputDateToISO(toInputDate(new Date(formState.startDate)))
      : inputDateToISO(toInputDate(new Date()));

    const endDate =
      isIndefinite || !formState.endDate
        ? null
        : inputDateToISO(toInputDate(new Date(formState.endDate)));

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este requerimiento de mantenimiento?`,
      () =>
        isNew
          ? createMaintenanceRequirement({
              modelId: formState.model!.id!.toString(),
              maintenanceId: formState.maintenance!.id!.toString(),
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formState.observations?.trim() || undefined,
              instructions: formState.instructions?.trim() || undefined,
              startDate,
              endDate,
            })
          : updateMaintenanceRequirement(id!, {
              kilometersFrequency: kmFreq > 0 ? kmFreq : undefined,
              daysFrequency: daysFreq > 0 ? daysFreq : undefined,
              observations: formState.observations?.trim() || undefined,
              instructions: formState.instructions?.trim() || undefined,
              startDate,
              endDate,
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

  const getFormData = () => ({
    formState,
    useKilometers,
    useDays,
    isIndefinite,
  });

  const sections: FormSection[] = [
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleModelEntitySearch
          entity={formState.model || null}
          onEntityChange={(model) =>
            setFormState((prev) => ({ ...prev, model: model || undefined }))
          }
          disabled={disabled || !isNew}
          contextScope="maintenanceRequirement"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <MaintenanceEntitySearch
          entity={formState.maintenance || null}
          onEntityChange={(maintenance) =>
            setFormState((prev) => ({
              ...prev,
              maintenance: maintenance || undefined,
            }))
          }
          disabled={disabled || !isNew}
          contextScope="maintenanceRequirement"
          getFormData={getFormData}
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
          value: useKilometers,
          onChange: (value: boolean) => setUseKilometers(value),
          key: "useKilometers",
          label: "Especificar frecuencia por kilómetros",
        },
        {
          type: "number",
          key: "kilometersFrequency",
          label: "Frecuencia en Kilómetros",
          value: formState.kilometersFrequency || 0,
          onChange: (value) =>
            setFormState((prev) => ({
              ...prev,
              kilometersFrequency: Number(value) || undefined,
            })),
          placeholder: "Ingrese frecuencia en kilómetros",
          min: 1,
          show: useKilometers,
        },
        {
          type: "checkbox",
          value: useDays,
          onChange: (value: boolean) => setUseDays(value),
          key: "useDays",
          label: "Especificar frecuencia por días",
        },
        {
          type: "number",
          key: "daysFrequency",
          label: "Frecuencia en Días",
          value: formState.daysFrequency || 0,
          onChange: (value) =>
            setFormState((prev) => ({
              ...prev,
              daysFrequency: Number(value) || undefined,
            })),
          placeholder: "Ingrese frecuencia en días",
          min: 1,
          show: useDays,
        },
      ],
    },
    {
      type: "fields",
      title: "Período",
      layout: "grid",
      fields: [
        {
          type: "date",
          value: formState.startDate
            ? toInputDate(new Date(formState.startDate))
            : toInputDate(new Date()),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, startDate: value })),
          key: "startDate",
          label: "Fecha Desde",
          required: true,
        },
        {
          type: "date",
          value: formState.endDate
            ? toInputDate(new Date(formState.endDate))
            : toInputDate(new Date()),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, endDate: value })),
          key: "endDate",
          label: "Fecha Hasta",
          show: !isIndefinite,
          min: formState.startDate
            ? toInputDate(new Date(formState.startDate))
            : undefined,
        },
        {
          type: "checkbox",
          value: isIndefinite,
          onChange: (value: boolean) => setIsIndefinite(value),
          key: "isIndefinite",
          label: "Vigencia indefinida (sin fecha de fin)",
          span: 2,
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
          value: formState.observations || "",
          onChange: (value) =>
            setFormState((prev) => ({ ...prev, observations: value })),
          placeholder: "Observaciones adicionales...",
          rows: 3,
        },
        {
          type: "textarea",
          key: "instructions",
          label: "Instrucciones",
          value: formState.instructions || "",
          onChange: (value) =>
            setFormState((prev) => ({ ...prev, instructions: value })),
          placeholder: "Instrucciones para el mantenimiento...",
          rows: 3,
        },
      ],
    },
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
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleDelete : undefined,
          saving,
          entityName: "Requerimiento",
        }}
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
