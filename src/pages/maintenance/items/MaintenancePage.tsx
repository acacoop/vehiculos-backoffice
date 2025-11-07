import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
} from "../../../services/maintenances";
import {
  getMaintenanceCategories,
  getMaintenanceCategoriesById,
} from "../../../services/categories";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Category } from "../../../types/category";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");
  const isReadOnly = !isNew && !id;

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    kilometersFrequency: undefined as number | undefined,
    daysFrequency: undefined as number | undefined,
    observations: "",
    instructions: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

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
    // Load categories for the dropdown
    const loadCategories = async () => {
      const response = await getMaintenanceCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    };

    loadCategories();
  }, []);

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
            categoryId: response.data.category?.id || "",
            kilometersFrequency: response.data.kilometersFrequency,
            daysFrequency: response.data.daysFrequency,
            observations: response.data.observations || "",
            instructions: response.data.instructions || "",
          });
        } else {
          showError(response.message || "Error al cargar el mantenimiento");
        }
      }, "Error al cargar el mantenimiento");
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isNew, executeLoad, showError]);

  // Load category from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      executeLoad(async () => {
        const response = await getMaintenanceCategoriesById(categoryId);
        if (response.success && response.data) {
          setFormData((prev) => ({ ...prev, categoryId: response.data!.id }));
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

    if (!formData.categoryId) {
      showError("Debe seleccionar una categoría");
      return;
    }

    const kilometersFreq = formData.kilometersFrequency;
    const daysFreq = formData.daysFrequency;

    if (!kilometersFreq && !daysFreq) {
      showError("Debe especificar al menos una frecuencia (kilómetros o días)");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este mantenimiento?`,
      () =>
        isNew
          ? createMaintenance({
              name: formData.name.trim(),
              categoryId: formData.categoryId,
              kilometersFrequency: formData.kilometersFrequency,
              daysFrequency: formData.daysFrequency,
              observations: formData.observations.trim() || undefined,
              instructions: formData.instructions.trim() || undefined,
            })
          : updateMaintenance(id!, {
              name: formData.name.trim(),
              categoryId: formData.categoryId,
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

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

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
        {
          type: "select",
          key: "categoryId",
          label: "Categoría",
          value: formData.categoryId,
          onChange: (value: string) =>
            setFormData({ ...formData, categoryId: value }),
          options: categoryOptions,
          required: true,
          disabled: isReadOnly,
        },
      ],
    },
    {
      type: "fields",
      title: "Frecuencia",
      layout: "horizontal",
      fields: [
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
