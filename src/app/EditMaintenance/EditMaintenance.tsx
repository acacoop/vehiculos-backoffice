import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import {
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
} from "../../services/maintenances";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import "./EditMaintenance.css";

export default function EditMaintenance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Determinar si estamos en modo creación o edición
  const isCreateMode = !id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceName, setMaintenanceName] = useState("");

  // ConfirmDialog hook
  const {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel: handleDialogCancel,
  } = useConfirmDialog();
  useEffect(() => {
    if (!isCreateMode && id) {
      loadMaintenance(id);
    }
  }, [id, isCreateMode]);

  const loadMaintenance = async (maintenanceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMaintenanceById(maintenanceId);

      if (response.success) {
        setMaintenanceName(response.data.name || "");
      } else {
        setError(response.message || "Error al cargar el mantenimiento");
      }
    } catch (err) {
      setError("Error al cargar el mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!maintenanceName.trim()) {
      setError("El nombre del mantenimiento es obligatorio");
      return;
    }

    const actionText = isCreateMode ? "crear" : "actualizar";
    const confirmMessage = `¿Está seguro que desea ${actionText} este mantenimiento?`;

    showConfirm(confirmMessage, async () => {
      setSaving(true);
      setError(null);

      try {
        let response;

        if (isCreateMode) {
          response = await createMaintenance({ name: maintenanceName.trim() });
        } else if (id) {
          response = await updateMaintenance(id, {
            name: maintenanceName.trim(),
          });
        }

        if (response?.success) {
          navigate("/maintenances");
        } else {
          setError(
            response?.message || `Error al ${actionText} el mantenimiento`
          );
        }
      } catch (err) {
        setError(`Error al ${actionText} el mantenimiento`);
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
      <div className="edit-maintenance-container">
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      </div>
    );
  }

  return (
    <div className="edit-maintenance-container">
      <div className="edit-maintenance-header">
        <h1 className="edit-maintenance-title">
          {isCreateMode ? "Nuevo Mantenimiento" : "Editar Mantenimiento"}
        </h1>
      </div>

      {error && (
        <Alert severity="error" style={{ margin: "20px 0" }}>
          {error}
        </Alert>
      )}

      <div className="edit-maintenance-content">
        <div className="form-section">
          <h3>Información del Mantenimiento</h3>
          <div className="form-group">
            <label htmlFor="maintenanceName" className="form-label">
              Nombre del Mantenimiento *
            </label>
            <input
              id="maintenanceName"
              type="text"
              value={maintenanceName}
              onChange={(e) => setMaintenanceName(e.target.value)}
              placeholder="Ingrese el nombre del mantenimiento"
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : isCreateMode
              ? "Crear Mantenimiento"
              : "Actualizar Mantenimiento"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
}
