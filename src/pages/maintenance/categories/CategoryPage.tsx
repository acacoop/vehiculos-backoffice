import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getMaintenanceCategoriesById,
  createMaintenanceCategory,
  updateMaintenanceCategory,
} from "../../../services/categories";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { Form } from "../../../components/Form";
import type { FormSection, FormButton } from "../../../components/Form";

export default function CategoryPage() {
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
  } = usePageState({ redirectOnSuccess: "/maintenance/categories" });

  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const isNew = location.pathname.endsWith("/new");
  const isReadOnly = !isNew && loading;
  const [formData, setFormData] = useState({
    name: "",
  });

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
          });
        } else {
          showError(response.message || "Error al cargar la categoría");
        }
      }, "Error al cargar la categoría");
    })();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

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
            })
          : updateMaintenanceCategory(id!, {
              name: formData.name.trim(),
            }),
      `Categoría ${actionText}da exitosamente`
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando categoría..." />;
  }

  const sections: FormSection[] = [
    {
      type: "fields",
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
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/categories"),
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
    <div className="container">
      <Form
        title={isNew ? "Nueva Categoría" : "Editar Categoría"}
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
