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
          showError("Mantenimiento no encontrado");
        }
      } else {
        showError("Error al cargar el mantenimiento");
      }
    } catch (err) {
      showError(
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

  // Configuración de secciones para FormLayout
  const sections: FormSection[] = [];

  // Sección 1: Información del mantenimiento
  sections.push({
    title: "Información del Mantenimiento",
    fields: [
      {
        key: "title",
        label: "Título del Mantenimiento",
        type: "text",
        value: title,
        onChange: (_key: string, value: string | number) =>
          setTitle(value as string),
        placeholder: "Ej: Cambio de aceite y filtros",
        required: true,
      },
      {
        key: "category",
        label: "Categoría",
        type: "categorySearch",
        value: categorySearchTerm,
        onChange: (_key: string, value: string | number) =>
          handleCategorySearchChange(value as string),
        entitySearch: true,
        searchTerm: categorySearchTerm,
        onSearchChange: handleCategorySearchChange,
        availableCategories: availableCategories,
        showDropdown: showCategoryDropdown,
        onCategorySelect: handleCategorySelect,
        onDropdownToggle: setShowCategoryDropdown,
        selectedCategory: selectedCategory,
        placeholder: "Buscar categoría...",
        required: true,
      },
    ],
  });

  // Sección 2: Frecuencia (layout horizontal)
  sections.push({
    title: "Frecuencia",
    horizontal: true,
    fields: [
      {
        key: "frequencyKm",
        label: "Frecuencia en Kilómetros",
        type: "number",
        value: frequencyKm,
        onChange: (_key: string, value: string | number) =>
          setFrequencyKm(value as number),
        placeholder: "10000",
        min: 1,
        required: true,
      },
      {
        key: "frequencyDays",
        label: "Frecuencia en Días",
        type: "number",
        value: frequencyDays,
        onChange: (_key: string, value: string | number) =>
          setFrequencyDays(value as number),
        placeholder: "365",
        min: 1,
        required: true,
      },
    ],
  });

  // Sección 3: Detalles adicionales
  sections.push({
    title: "Detalles Adicionales",
    fields: [
      {
        key: "observations",
        label: "Observaciones",
        type: "textarea",
        value: observations,
        onChange: (_key: string, value: string | number) =>
          setObservations(value as string),
        placeholder: "Observaciones adicionales...",
      },
      {
        key: "instructions",
        label: "Instrucciones",
        type: "textarea",
        value: instructions,
        onChange: (_key: string, value: string | number) =>
          setInstructions(value as string),
        placeholder: "Instrucciones detalladas para el mantenimiento...",
      },
    ],
  });

  return (
    <>
      <FormLayout
        title={isCreateMode ? "Nuevo Mantenimiento" : "Editar Mantenimiento"}
        sections={sections}
      >
        <ButtonGroup>
          <CancelButton
            text="Cancelar"
            onClick={handleCancel}
            disabled={saving || deleting}
          />
          {!isCreateMode && (
            <DeleteButton
              text="Eliminar"
              onClick={handleDelete}
              disabled={saving || deleting}
              loading={deleting}
            />
          )}
          <ConfirmButton
            text={
              saving
                ? "Guardando..."
                : isCreateMode
                ? "Crear Mantenimiento"
                : "Actualizar Mantenimiento"
            }
            onClick={handleSave}
            disabled={saving || deleting}
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
