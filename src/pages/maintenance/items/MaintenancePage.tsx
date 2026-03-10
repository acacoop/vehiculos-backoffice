import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
} from "../../../services/maintenances";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Maintenance } from "../../../types/maintenance";
import { Form, type FormSection } from "../../../components/Form";
import { MaintenanceCategoryEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import { ROUTES } from "../../../common";

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<Maintenance>>({});

  // UI-only checkbox states
  const [useKilometers, setUseKilometers] = useState(false);
  const [useDays, setUseDays] = useState(false);

  // Handler for initial data
  const handleInitialData = useCallback((data: Partial<Maintenance>) => {
    setFormState(data);
    setUseKilometers(!!data.kilometersFrequency);
    setUseDays(!!data.daysFrequency);
  }, []);

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
  } = usePageState<Partial<Maintenance>>({
    redirectOnSuccess: "/maintenance/items",
    startInViewMode: !isNew,
    scope: "maintenance",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing maintenance (new entities handled via onInitialData)
    if (!isNew && id) {
      let cancelled = false;

      (async () => {
        await executeLoad(async () => {
          const response = await getMaintenanceById(id);

          if (cancelled) return;

          if (response.success && response.data) {
            const hasKm =
              response.data.kilometersFrequency !== undefined &&
              response.data.kilometersFrequency > 0;
            const hasDays =
              response.data.daysFrequency !== undefined &&
              response.data.daysFrequency > 0;

            setFormState(response.data);
            setUseKilometers(hasKm);
            setUseDays(hasDays);
            setOriginalData({
              formState: response.data,
              useKilometers: hasKm,
              useDays: hasDays,
            });
          } else {
            showError(response.message || "Error al cargar el mantenimiento");
          }
        }, "Error al cargar el mantenimiento");
      })();

      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/maintenance/items");
    } else {
      const original = cancelEdit<{
        formState: Partial<Maintenance>;
        useKilometers: boolean;
        useDays: boolean;
      }>();
      if (original) {
        setFormState(original.formState);
        setUseKilometers(original.useKilometers);
        setUseDays(original.useDays);
      }
    }
  };

  const handleSave = () => {
    if (!formState.name?.trim()) {
      showError("El nombre del mantenimiento es obligatorio");
      return;
    }

    if (!formState.category) {
      showError("Debe seleccionar una categoría");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este mantenimiento?`,
      () =>
        isNew
          ? createMaintenance({
              name: formState.name!.trim(),
              categoryId: formState.category!.id,
              kilometersFrequency: formState.kilometersFrequency,
              daysFrequency: formState.daysFrequency,
              observations: formState.observations?.trim() || undefined,
              instructions: formState.instructions?.trim() || undefined,
            })
          : updateMaintenance(id!, {
              name: formState.name!.trim(),
              categoryId: formState.category!.id,
              kilometersFrequency: formState.kilometersFrequency,
              daysFrequency: formState.daysFrequency,
              observations: formState.observations?.trim() || undefined,
              instructions: formState.instructions?.trim() || undefined,
            }),
      `Mantenimiento ${actionText}do exitosamente`,
      {
        isCreate: isNew,
        entityRoute: "/maintenance/posibles",
      },
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando mantenimiento..." />;
  }

  const getFormData = () => ({ formState, useKilometers, useDays });

  const sections: FormSection[] = [
    {
      type: "fields",
      title: "Información del mantenimiento",
      layout: "vertical",
      fields: [
        {
          type: "text",
          key: "name",
          label: "Nombre",
          value: formState.name || "",
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, name: value })),
          required: true,
          placeholder: "Ej: Cambio de aceite de motor",
        },
      ],
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <MaintenanceCategoryEntitySearch
          entity={formState.category || null}
          onEntityChange={(category) =>
            setFormState((prev) => ({
              ...prev,
              category: category || undefined,
            }))
          }
          disabled={disabled}
          contextScope="maintenance"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "fields",
      title: "Frecuencia",
      layout: "vertical",
      fields: [
        {
          type: "checkbox",
          key: "useKilometers",
          label: "Usar frecuencia en kilómetros",
          value: useKilometers,
          onChange: (value: boolean) => {
            setUseKilometers(value);
            if (!value) {
              setFormState((prev) => ({
                ...prev,
                kilometersFrequency: undefined,
              }));
            }
          },
        },
        {
          type: "number",
          key: "kilometersFrequency",
          label: "Kilómetros",
          value: formState.kilometersFrequency || 0,
          onChange: (value: number | undefined) =>
            setFormState((prev) => ({
              ...prev,
              kilometersFrequency: value || undefined,
            })),
          placeholder: "Frecuencia en kilómetros",
          min: 1,
          show: useKilometers,
        },
        {
          type: "checkbox",
          key: "useDays",
          label: "Usar frecuencia en días",
          value: useDays,
          onChange: (value: boolean) => {
            setUseDays(value);
            if (!value) {
              setFormState((prev) => ({ ...prev, daysFrequency: undefined }));
            }
          },
        },
        {
          type: "number",
          key: "daysFrequency",
          label: "Días",
          value: formState.daysFrequency || 0,
          onChange: (value: number | undefined) =>
            setFormState((prev) => ({
              ...prev,
              daysFrequency: value || undefined,
            })),
          placeholder: "Frecuencia en días",
          min: 1,
          show: useDays,
        },
      ],
    },
    {
      type: "fields",
      title: "Detalles adicionales",
      layout: "vertical",
      fields: [
        {
          type: "textarea",
          key: "observations",
          label: "Observaciones",
          value: formState.observations || "",
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, observations: value })),
          placeholder: "Observaciones adicionales...",
          rows: 3,
        },
        {
          type: "textarea",
          key: "instructions",
          label: "Instrucciones",
          value: formState.instructions || "",
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, instructions: value })),
          placeholder: "Instrucciones para realizar el mantenimiento...",
          rows: 4,
        },
      ],
    },
  ];

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: ROUTES.HOME },
          { label: "Mantenimientos", href: ROUTES.MAINTENANCE_ITEMS },
          {
            label: isNew
              ? "Nuevo mantenimiento"
              : formState.name || "Editar mantenimiento",
          },
        ]}
        backButton={{
          text: "Volver",
          fallbackHref: ROUTES.MAINTENANCE_ITEMS,
        }}
      />
      <Form
        title={isNew ? "Nuevo mantenimiento" : "Editar mantenimiento"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          saving,
          entityName: "Mantenimiento",
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
