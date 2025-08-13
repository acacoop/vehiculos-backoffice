import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenanceCategories,
  getMaintenancePossibles,
  createMaintenanceItem,
  updateMaintenanceItem,
  deleteMaintenanceItem,
  type MaintenanceItemData,
} from "../../services/maintenances";
import { CategorySearch } from "../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { useConfirmDialog } from "../../hooks";
import { useNotification } from "../../hooks/useNotification";
import type { Maintenance } from "../../types/maintenance";
import "./EditMaintenance.css";

export default function EditMaintenance() {
  const { maintenanceId } = useParams<{ maintenanceId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode = location.pathname.includes("/create");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Maintenance | null>(
    null
  );
  const [frequencyKm, setFrequencyKm] = useState<number>(10000);
  const [frequencyDays, setFrequencyDays] = useState<number>(365);
  const [observations, setObservations] = useState("");
  const [instructions, setInstructions] = useState("");

  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Maintenance[]>(
    []
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [allCategories, setAllCategories] = useState<Maintenance[]>([]);
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
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isCreateMode && maintenanceId && allCategories.length > 0) {
      loadMaintenance(maintenanceId);
    }
  }, [maintenanceId, isCreateMode, allCategories]);

  const loadCategories = async () => {
    try {
      const response = await getMaintenanceCategories({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setAllCategories(response.data);
        setAvailableCategories(response.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadMaintenance = async (id: string) => {
    setLoading(true);
    try {
      const response = await getMaintenancePossibles();

      if (response.success && response.data) {
        const maintenance = response.data.find((item) => item.id === id);

        if (maintenance) {
          setTitle(maintenance.name);

          setFrequencyKm(10000);
          setFrequencyDays(365);
          setObservations("");
          setInstructions("");

          if (maintenance.maintenanceCategoryName && allCategories.length > 0) {
            const category = allCategories.find(
              (c) =>
                c.name.toLowerCase() ===
                maintenance.maintenanceCategoryName.toLowerCase()
            );
            if (category) {
              setSelectedCategory(category);
              setCategorySearchTerm(category.name);
            } else {
              setCategorySearchTerm(maintenance.maintenanceCategoryName);
            }
          }
        } else {
          setError("Mantenimiento no encontrado");
        }
      } else {
        setError("Error al cargar el mantenimiento");
      }
    } catch (err) {
      setError(
        "Error al cargar el mantenimiento: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categorySearchTerm.length >= 1) {
      const filtered = allCategories.filter((category) =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
      );
      setAvailableCategories(filtered);
      setShowCategoryDropdown(filtered.length > 0);
    } else {
      setAvailableCategories(allCategories);
      setShowCategoryDropdown(false);
    }
  }, [categorySearchTerm, allCategories]);

  const handleCategorySearchChange = (term: string) => {
    setCategorySearchTerm(term);
    if (!term) {
      setSelectedCategory(null);
      setShowCategoryDropdown(false);
    }
  };

  const handleCategorySelect = (category: Maintenance) => {
    setSelectedCategory(category);
    setCategorySearchTerm(category.name);
    setShowCategoryDropdown(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError("El título es obligatorio");
      return;
    }
    if (!selectedCategory) {
      showError("Debe seleccionar una categoría");
      return;
    }
    if (frequencyKm <= 0) {
      showError("La frecuencia en kilómetros debe ser mayor a 0");
      return;
    }
    if (frequencyDays <= 0) {
      showError("La frecuencia en días debe ser mayor a 0");
      return;
    }

    const actionText = isCreateMode ? "crear" : "actualizar";
    const confirmMessage = `¿Está seguro que desea ${actionText} este mantenimiento?`;

    showConfirm(confirmMessage, async () => {
      setSaving(true);
      setError(null);

      try {
        const maintenanceData: MaintenanceItemData = {
          title: title.trim(),
          categoryId: selectedCategory.id,
          frequencyKm,
          frequencyDays,
          observations: observations.trim() || undefined,
          instructions: instructions.trim() || undefined,
        };

        let response;
        if (isCreateMode) {
          response = await createMaintenanceItem(maintenanceData);
        } else if (maintenanceId) {
          response = await updateMaintenanceItem(
            maintenanceId,
            maintenanceData
          );
        }

        if (response?.success) {
          const successMessage = isCreateMode
            ? "Mantenimiento creado exitosamente"
            : "Mantenimiento actualizado exitosamente";
          showSuccess(successMessage);

          setTimeout(() => {
            navigate("/maintenances");
          }, 1500);
        } else {
          showError(
            response?.message || `Error al ${actionText} el mantenimiento`
          );
        }
      } catch (err) {
        showError(`Error al ${actionText} el mantenimiento`);
      } finally {
        setSaving(false);
      }
    });
  };

  const handleCancel = () => {
    navigate("/maintenances");
  };

  const handleDelete = () => {
    if (!maintenanceId) return;

    showConfirm(
      "¿Está seguro que desea eliminar este mantenimiento? Esta acción no se puede deshacer.",
      async () => {
        setDeleting(true);
        setError(null);

        try {
          const response = await deleteMaintenanceItem(maintenanceId);

          if (response.success) {
            showSuccess("Mantenimiento eliminado exitosamente");
            setTimeout(() => {
              navigate("/maintenances");
            }, 1500);
          } else {
            showError(response.message || "Error al eliminar el mantenimiento");
          }
        } catch (err) {
          showError("Error al eliminar el mantenimiento");
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="edit-maintenance-container">
        <div className="edit-maintenance-loading">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
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

      <div className="edit-maintenance-form">
        <div className="form-section">
          <h3>Información del Mantenimiento</h3>

          <div className="form-group">
            <label className="form-label">Título del Mantenimiento *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cambio de aceite y filtros"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <CategorySearch
              searchTerm={categorySearchTerm}
              onSearchChange={handleCategorySearchChange}
              availableCategories={availableCategories}
              showDropdown={showCategoryDropdown}
              onCategorySelect={handleCategorySelect}
              onDropdownToggle={setShowCategoryDropdown}
              placeholder="Buscar categoría..."
              className="form-input"
            />
            {selectedCategory && (
              <div className="selected-entity">
                <span>Categoría seleccionada: {selectedCategory.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Frecuencia</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frecuencia en Kilómetros *</label>
              <input
                type="number"
                value={frequencyKm}
                onChange={(e) => setFrequencyKm(Number(e.target.value))}
                min="1"
                placeholder="10000"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Frecuencia en Días *</label>
              <input
                type="number"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                min="1"
                placeholder="365"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Detalles Adicionales</h3>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones adicionales..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instrucciones</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instrucciones detalladas para el mantenimiento..."
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving || deleting}
          >
            Cancelar
          </button>

          {!isCreateMode && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || deleting}
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

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </div>
  );
}
