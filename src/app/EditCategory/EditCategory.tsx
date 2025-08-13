import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
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
import "./EditCategory.css";

export default function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Determinar si estamos en modo creación o edición
  const isCreateMode = !id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      const response = await getMaintenanceById(categoryId);

      if (response.success && response.data) {
        // La respuesta tiene estructura anidada: response.data.data.name
        const responseData = response.data as any;
        const actualData = responseData.data || responseData;
        const nameValue = actualData.name;

        setCategoryName(nameValue || "");
      } else {
        setError(
          response.message || "Error al cargar la categoría de mantenimiento"
        );
      }
    } catch (err) {
      setError(
        "Error al cargar la categoría de mantenimiento: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setError("La categoría de mantenimiento es obligatoria");
      return;
    }

    const actionText = isCreateMode ? "crear" : "actualizar";
    const confirmMessage = `¿Está seguro que desea ${actionText} esta categoría de mantenimiento?`;

    showConfirm(confirmMessage, async () => {
      setSaving(true);
      setError(null);

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
      setError(null);

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

  return (
    <div className="edit-category-container">
      <div className="edit-category-header">
        <h1 className="edit-category-title">
          {isCreateMode
            ? "Nueva Categoría de Mantenimiento"
            : "Editar Categoría de Mantenimiento"}
        </h1>
      </div>

      {error && (
        <Alert severity="error" style={{ margin: "20px 0" }}>
          {error}
        </Alert>
      )}

      <div className="edit-category-content">
        <div className="form-section">
          <h3>Información de la Categoría</h3>
          <div className="form-group">
            <label htmlFor="categoryName" className="form-label">
              Categoría de Mantenimiento *
            </label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ingrese la categoría del mantenimiento"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>

          {!isCreateMode && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={saving}
              style={{
                marginLeft: "10px",
                backgroundColor: "#dc3545",
                color: "white",
              }}
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginLeft: "10px" }}
          >
            {saving
              ? "Guardando..."
              : isCreateMode
              ? "Crear Categoría"
              : "Actualizar Categoría"}
          </button>
        </div>
      </div>

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
  );
}
