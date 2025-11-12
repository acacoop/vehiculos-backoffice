import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
} from "../../../services/maintenances";
import { getMaintenanceCategoryById } from "../../../services/categories";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Category } from "../../../types/category";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";
import { MaintenanceCategoryEntitySearch } from "../../../components/EntitySearch/EntitySearch";

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");
  const isReadOnly = !isNew && !id;

  const [formData, setFormData] = useState({
    name: "",
    kilometersFrequency: undefined as number | undefined,
    daysFrequency: undefined as number | undefined,
    observations: "",
    instructions: "",
  });
  const [category, setCategory] = useState<Category | null>(null);
  const [useKilometers, setUseKilometers] = useState(false);
  const [useDays, setUseDays] = useState(false);

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
  } = usePageState({ redirectOnSuccess: "/maintenance/items" });

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceById(id);

        if (cancelled) return;

        if (response.success && response.data) {
          setFormData({
            name: response.data.name || "",
            kilometersFrequency: response.data.kilometersFrequency,
            daysFrequency: response.data.daysFrequency,
            observations: response.data.observations || "",
            instructions: response.data.instructions || "",
          });
          setCategory(response.data.category || null);
          // Initialize checkboxes based on existing frequency values
          setUseKilometers(
            response.data.kilometersFrequency !== undefined &&
              response.data.kilometersFrequency > 0,
          );
          setUseDays(
            response.data.daysFrequency !== undefined &&
              response.data.daysFrequency > 0,
          );
        } else {
          showError(response.message || "Error al cargar el mantenimiento");
        }
      }, "Error al cargar el mantenimiento");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load category from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      executeLoad(async () => {
        const response = await getMaintenanceCategoryById(categoryId);
        if (response.success && response.data) {
          setCategory(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      showError("El nombre del mantenimiento es obligatorio");
      return;
    }

    if (!category) {
      showError("Debe seleccionar una categoría");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este mantenimiento?`,
      () =>
        isNew
          ? createMaintenance({
              name: formData.name.trim(),
              categoryId: category.id,
              kilometersFrequency: formData.kilometersFrequency,
              daysFrequency: formData.daysFrequency,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
            })
          : updateMaintenance(id!, {
              name: formData.name.trim(),
              categoryId: category.id,
              kilometersFrequency: formData.kilometersFrequency,
              daysFrequency: formData.daysFrequency,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
            }),
      `Mantenimiento ${actionText}do exitosamente`,
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando mantenimiento..." />;
  }

  const sections: FormSection[] = [
    {
      type: "fields",
      title: "Información del Mantenimiento",
      layout: "vertical",
      fields: [
        {
          type: "text",
          key: "name",
          label: "Nombre",
          value: formData.name,
          onChange: (value: string) =>
            setFormData({ ...formData, name: value }),
          required: true,
          placeholder: "Ej: Cambio de aceite de motor",
          disabled: isReadOnly,
        },
      ],
    },
    {
      type: "entity",
      render: (
        <MaintenanceCategoryEntitySearch
          entity={category}
          onEntityChange={setCategory}
        />
      ),
    },
    {
      type: "fields",
      title: "Frecuencia",
      layout: "horizontal",
      fields: [
        {
          type: "checkbox",
          key: "useKilometers",
          label: "Usar frecuencia en kilómetros",
          value: useKilometers,
          onChange: (value: boolean) => {
            setUseKilometers(value);
            if (!value) {
              setFormData({ ...formData, kilometersFrequency: undefined });
            }
          },
          disabled: isReadOnly,
        },
        {
          type: "number",
          key: "kilometersFrequency",
          label: "Kilómetros",
          value: formData.kilometersFrequency || 0,
          onChange: (value: number | undefined) =>
            setFormData({
              ...formData,
              kilometersFrequency: value || undefined,
            }),
          placeholder: "Frecuencia en kilómetros",
          min: 1,
          disabled: isReadOnly,
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
              setFormData({ ...formData, daysFrequency: undefined });
            }
          },
          disabled: isReadOnly,
        },
        {
          type: "number",
          key: "daysFrequency",
          label: "Días",
          value: formData.daysFrequency || 0,
          onChange: (value: number | undefined) =>
            setFormData({ ...formData, daysFrequency: value || undefined }),
          placeholder: "Frecuencia en días",
          min: 1,
          disabled: isReadOnly,
          show: useDays,
        },
      ],
    },
    {
      type: "fields",
      title: "Detalles Adicionales",
      layout: "vertical",
      fields: [
        {
          type: "textarea",
          key: "observations",
          label: "Observaciones",
          value: formData.observations,
          onChange: (value: string) =>
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
          onChange: (value: string) =>
            setFormData({ ...formData, instructions: value }),
          placeholder: "Instrucciones para realizar el mantenimiento...",
          rows: 4,
          disabled: isReadOnly,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/items"),
      disabled: saving,
    },
    ...(!isReadOnly
      ? [
          {
            text: saving
              ? "Guardando..."
              : isNew
              ? "Crear Mantenimiento"
              : "Actualizar Mantenimiento",
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
        title={isNew ? "Nuevo Mantenimiento" : "Editar Mantenimiento"}
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
