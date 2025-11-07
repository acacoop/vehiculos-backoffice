import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getMaintenanceCategoriesById,
  createMaintenanceCategory,
  updateMaintenanceCategory,
} from "../../../services/categories";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import "./CategoryPage.css";
import { Form } from "../../../components/Form";
import type { FormSection, FormButton } from "../../../components/Form";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const isReadOnly = !isNew && !id; // View mode (if needed in future)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
  } = usePageState({ redirectOnSuccess: "/categories" });

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceCategoriesById(id);

        if (cancelled) return;

        if (response.success && response.data) {
          setFormData({
            name: response.data.name || "",
            description: response.data.description || "",
          });
        } else {
          showError(response.message || "Error al cargar la categoría");
        }
      }, "Error al cargar la categoría");
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isNew, executeLoad, showError]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      showError("El nombre de la categoría es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} esta categoría?`,
      () =>
        isNew
          ? createMaintenanceCategory({
              name: formData.name.trim(),
              description: formData.description.trim(),
            })
          : updateMaintenanceCategory(id!, {
              name: formData.name.trim(),
              description: formData.description.trim(),
            }),
      `Categoría ${actionText}da exitosamente`,
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando categoría..." />;
  }

  const sections: FormSection[] = [
    {
      title: "Información de la Categoría",
      layout: "vertical",
      fields: [
        {
          type: "text",
          key: "name",
          label: "Nombre",
          value: formData.name,
          onChange: (value) => setFormData({ ...formData, name: value }),
          required: true,
          placeholder: "Ej: Cambio de aceite",
          disabled: isReadOnly,
        },
        {
          type: "textarea",
          key: "description",
          label: "Descripción",
          value: formData.description,
          onChange: (value) => setFormData({ ...formData, description: value }),
          placeholder: "Descripción opcional de la categoría...",
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
      onClick: () => goTo("/categories"),
      disabled: saving,
    },
    ...(!isReadOnly
      ? [
          {
            text: saving
              ? "Guardando..."
              : isNew
              ? "Crear Categoría"
              : "Actualizar Categoría",
            variant: "primary" as const,
            onClick: handleSave,
            disabled: saving,
            loading: saving,
          },
        ]
      : []),
  ];

  return (
    <div className="category-page">
      <Form
        title={isNew ? "Nueva Categoría" : "Editar Categoría"}
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
