import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../../services/maintenances";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useNotification } from "../../hooks/useNotification";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import FormLayout from "../../components/FormLayout/FormLayout";
import type { FormSection } from "../../components/FormLayout/FormLayout";
import {
  CancelButton,
  DeleteButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components/Buttons/Buttons";
import "./EditCategory.css";

export default function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Determinar si estamos en modo creación o edición
  const isCreateMode = !id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // ConfirmDialog hook
  const {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel: handleDialogCancel,
  } = useConfirmDialog();

  // Notification hook
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    if (!isCreateMode && id) {
      loadCategory(id);
    }
  }, [id, isCreateMode]);

  const loadCategory = async (categoryId: string) => {
    setLoading(true);

    try {
      const response = await getMaintenanceById(categoryId);

      if (response.success && response.data) {
        // La respuesta tiene estructura anidada: response.data.data.name
        const responseData = response.data as any;
        const actualData = responseData.data || responseData;
        const nameValue = actualData.name;

        setCategoryName(nameValue || "");
      } else {
        showError(
          response.message || "Error al cargar la categoría de mantenimiento"
        );
      }
    } catch (err) {
      showError(
        "Error al cargar la categoría de mantenimiento: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      showError("La categoría de mantenimiento es obligatoria");
      return;
    }

    const actionText = isCreateMode ? "crear" : "actualizar";
    const confirmMessage = `¿Está seguro que desea ${actionText} esta categoría de mantenimiento?`;

    showConfirm(confirmMessage, async () => {
      setSaving(true);

      try {
        let response;

        if (isCreateMode) {
          response = await createMaintenance({ name: categoryName.trim() });
        } else if (id) {
          response = await updateMaintenance(id, {
            name: categoryName.trim(),
          });
        }

        if (response?.success) {
          const successMessage = isCreateMode
            ? "Categoría creada exitosamente"
            : "Categoría actualizada exitosamente";
          showSuccess(successMessage);

          // Pequeño delay para que se vea la notificación antes de navegar
          setTimeout(() => {
            navigate("/maintenances");
          }, 1500);
        } else {
          showError(
            response?.message ||
              `Error al ${actionText} la categoría de mantenimiento`
          );
        }
      } catch (err) {
        showError(`Error al ${actionText} la categoría de mantenimiento`);
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmMessage =
      "¿Está seguro que desea eliminar esta categoría de mantenimiento? Esta acción no se puede deshacer.";

    showConfirm(confirmMessage, async () => {
      setSaving(true);

      try {
        const response = await deleteMaintenance(id);

        if (response.success) {
          showSuccess("Categoría eliminada exitosamente");

          // Pequeño delay para que se vea la notificación antes de navegar
          setTimeout(() => {
            navigate("/maintenances");
          }, 1500);
        } else {
          showError(
            response.message ||
              "Error al eliminar la categoría de mantenimiento"
          );
        }
      } catch (err) {
        showError("Error al eliminar la categoría de mantenimiento");
      } finally {
        setSaving(false);
      }
    });
  };

  const handleCancel = () => {
    navigate("/maintenances");
  };

  if (loading) {
    return (
      <div className="edit-category-container">
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      </div>
    );
  }

  // Configuración de secciones para FormLayout
  const sections: FormSection[] = [
    {
      title: "Información de la Categoría",
      fields: [
        {
          key: "categoryName",
          label: "Categoría de Mantenimiento",
          type: "text",
          value: categoryName,
          onChange: (_key: string, value: string | number) =>
            setCategoryName(value as string),
          placeholder: "Ingrese la categoría del mantenimiento",
          required: true,
        },
      ],
    },
  ];

  return (
    <>
      <FormLayout
        title={
          isCreateMode
            ? "Nueva Categoría de Mantenimiento"
            : "Editar Categoría de Mantenimiento"
        }
        sections={sections}
      >
        <ButtonGroup>
          <CancelButton
            text="Cancelar"
            onClick={handleCancel}
            disabled={saving}
          />
          {!isCreateMode && (
            <DeleteButton
              text="Eliminar"
              onClick={handleDelete}
              disabled={saving}
              loading={saving}
            />
          )}
          <ConfirmButton
            text={
              saving
                ? "Guardando..."
                : isCreateMode
                ? "Crear Categoría"
                : "Actualizar Categoría"
            }
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          />
        </ButtonGroup>
      </FormLayout>

      <ConfirmDialog
        open={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleDialogCancel}
      />

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </>
  );
}
