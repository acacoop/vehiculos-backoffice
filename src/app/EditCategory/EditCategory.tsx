import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../../services/maintenances";
import { useConfirmDialog, useNotification } from "../../hooks";
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
  const isCreateMode = !id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel: handleDialogCancel,
  } = useConfirmDialog();
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
        const responseData = response.data as any;
        const actualData = responseData.data || responseData;
        setCategoryName(actualData.name || "");
      } else {
        showError(
          response.message || "Error al cargar la categoría de mantenimiento"
        );
      }
    } catch (err) {
      showError(
        `Error al cargar la categoría: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: "create" | "update" | "delete") => {
    setSaving(true);
    try {
      let response;

      switch (action) {
        case "create":
          response = await createMaintenance({ name: categoryName.trim() });
          break;
        case "update":
          response = id
            ? await updateMaintenance(id, { name: categoryName.trim() })
            : null;
          break;
        case "delete":
          response = id ? await deleteMaintenance(id) : null;
          break;
      }

      if (response?.success) {
        const messages = {
          create: "Categoría creada exitosamente",
          update: "Categoría actualizada exitosamente",
          delete: "Categoría eliminada exitosamente",
        };
        showSuccess(messages[action]);
        setTimeout(() => navigate("/maintenances"), 1500);
      } else {
        const actionText = {
          create: "crear",
          update: "actualizar",
          delete: "eliminar",
        }[action];
        showError(response?.message || `Error al ${actionText} la categoría`);
      }
    } catch (err) {
      const actionText = {
        create: "crear",
        update: "actualizar",
        delete: "eliminar",
      }[action];
      showError(`Error al ${actionText} la categoría de mantenimiento`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!categoryName.trim()) {
      showError("La categoría de mantenimiento es obligatoria");
      return;
    }

    const actionText = isCreateMode ? "crear" : "actualizar";
    showConfirm(
      `¿Está seguro que desea ${actionText} esta categoría de mantenimiento?`,
      () => performAction(isCreateMode ? "create" : "update")
    );
  };

  const handleDelete = () => {
    if (!id) return;

    showConfirm(
      "¿Está seguro que desea eliminar esta categoría de mantenimiento? Esta acción no se puede deshacer.",
      () => performAction("delete")
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos de la categoría..." />;
  }

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
      <div className="edit-category-container">
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
              onClick={() => navigate("/maintenances")}
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
      </div>
    </>
  );
}
