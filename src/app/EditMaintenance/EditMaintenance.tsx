import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenanceCategories,
  createMaintenanceItem,
  updateMaintenanceItem,
  deleteMaintenanceItem,
  getMaintenancePossibleById,
} from "../../services/maintenances";
import { getVehiclesByMaintenanceId } from "../../services/vehicles";
import { getVehicleBrand, getVehicleModel } from "../../common/utils";
import {
  FormLayout,
  ConfirmDialog,
  NotificationToast,
  Table,
  LoadingSpinner,
} from "../../components";
import { PencilIcon } from "../../components/Table/table";
import {
  FieldType,
  EntityType,
  InputType,
} from "../../components/FormLayout/FormLayout";
import {
  useConfirmDialog,
  useCategorySearch,
  useNotification,
} from "../../hooks";
import type { Maintenance, MaintenanceItem } from "../../types/maintenance";
import type { ServiceResponse, PaginationParams } from "../../common";
import "./EditMaintenance.css";

export default function EditMaintenance() {
  const { maintenanceId } = useParams<{ maintenanceId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode = location.pathname.includes("/create");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [frequencyKm, setFrequencyKm] = useState<number>(10000);
  const [frequencyDays, setFrequencyDays] = useState<number>(365);
  const [observations, setObservations] = useState("");
  const [instructions, setInstructions] = useState("");

  const [allCategories, setAllCategories] = useState<Maintenance[]>([]);
  const categorySearch = useCategorySearch();
  const {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel: handleDialogCancel,
  } = useConfirmDialog();
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  const handleFieldChange = (key: string, value: any) => {
    switch (key) {
      case "title":
        setTitle(value);
        break;
      case "frequencyKm":
        setFrequencyKm(Number(value) || 0);
        break;
      case "frequencyDays":
        setFrequencyDays(Number(value) || 0);
        break;
      case "observations":
        setObservations(value);
        break;
      case "instructions":
        setInstructions(value);
        break;
      default:
        break;
    }
  };

  // Column definition for vehicles table
  const vehicleColumns = [
    { field: "licensePlate", headerName: "Patente", flex: 1 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1 },
    { field: "year", headerName: "Año", flex: 1 },
  ];

  // Function to navigate to maintenance assignment page
  const handleAddVehicle = () => {
    if (maintenanceId) {
      navigate(`/maintenance-assignment/${maintenanceId}`);
    }
  };

  // Function to get vehicles assigned to this maintenance
  const getVehiclesData = async (
    pagination: PaginationParams
  ): Promise<ServiceResponse<any[]>> => {
    if (!maintenanceId || isCreateMode) {
      return {
        success: true,
        data: [],
        message: "No hay vehículos para mostrar",
      };
    }

    try {
      const response = await getVehiclesByMaintenanceId(
        maintenanceId,
        pagination
      );

      if (!response.success) {
        return {
          success: false,
          data: [],
          message: response.message || "Error al cargar vehículos",
        };
      }

      const mappedData = response.data.map((vehicle: any, index: number) => {
        const brand = getVehicleBrand(vehicle) || "N/A";
        const model = getVehicleModel(vehicle) || "N/A";
        return {
          id: vehicle.id || `vehicle-${Date.now()}-${index}`,
          assignmentId: vehicle.assignmentId,
          licensePlate: vehicle.licensePlate || "N/A",
          brand,
          model,
          year: vehicle.year?.toString() || "N/A",
        };
      });

      return {
        success: true,
        data: mappedData,
        pagination: response.pagination,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Error al cargar vehículos del mantenimiento",
      };
    }
  };

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
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadMaintenance = async (id: string) => {
    setLoading(true);
    try {
      const response = await getMaintenancePossibleById(id);
      console.log("Maintenance fetch response:", response);
      if (response.success && response.data) {
        const maintenance: MaintenanceItem = response.data;
        setTitle(maintenance.title);
        setFrequencyKm(maintenance.frequencyKm ?? 10000);
        setFrequencyDays(maintenance.frequencyDays ?? 365);
        setObservations(maintenance.observations ?? "");
        setInstructions(maintenance.instructions ?? "");
        if (maintenance.categoryName && allCategories.length > 0) {
          const category = allCategories.find(
            (c) =>
              c.name.toLowerCase() === maintenance.categoryName!.toLowerCase()
          );
          if (category) {
            categorySearch.selectCategory(category);
          }
        }
      } else {
        showError("Mantenimiento no encontrado");
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

  // Validation function
  const validateForm = (): string | null => {
    if (!title.trim()) return "El título es obligatorio";
    if (!categorySearch.selectedCategory)
      return "Debe seleccionar una categoría";
    if (frequencyKm <= 0)
      return "La frecuencia en kilómetros debe ser mayor a 0";
    if (frequencyDays <= 0) return "La frecuencia en días debe ser mayor a 0";
    return null;
  };

  // Generic operation handler
  const performOperation = async (
    operation: "create" | "update" | "delete"
  ) => {
    const validationError = operation !== "delete" ? validateForm() : null;
    if (validationError) {
      showError(validationError);
      return;
    }

    const actionText = {
      create: "crear",
      update: "actualizar",
      delete: "eliminar",
    }[operation];

    showConfirm(
      `¿Está seguro que desea ${actionText} este mantenimiento?${
        operation === "delete" ? " Esta acción no se puede deshacer." : ""
      }`,
      async () => {
        setSaving(true);

        try {
          let response;

          switch (operation) {
            case "create":
              response = await createMaintenanceItem({
                title: title.trim(),
                categoryId: categorySearch.selectedCategory!.id,
                frequencyKm,
                frequencyDays,
                observations: observations.trim() || undefined,
                instructions: instructions.trim() || undefined,
              });
              break;
            case "update":
              if (!maintenanceId) return;
              response = await updateMaintenanceItem(maintenanceId, {
                title: title.trim(),
                categoryId: categorySearch.selectedCategory!.id,
                frequencyKm,
                frequencyDays,
                observations: observations.trim() || undefined,
                instructions: instructions.trim() || undefined,
              });
              break;
            case "delete":
              if (!maintenanceId) return;
              response = await deleteMaintenanceItem(maintenanceId);
              break;
          }

          if (response?.success) {
            const successMessages = {
              create: "Mantenimiento creado exitosamente",
              update: "Mantenimiento actualizado exitosamente",
              delete: "Mantenimiento eliminado exitosamente",
            };
            showSuccess(successMessages[operation]);
            setTimeout(() => navigate("/maintenances"), 1500);
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
      }
    );
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    performOperation(isCreateMode ? "create" : "update");
  };

  const handleDelete = () => {
    if (!maintenanceId) return;
    performOperation("delete");
  };

  const handleCancel = () => {
    navigate("/maintenances");
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos del mantenimiento..." />;
  }

  const buildFormFields = (): any[] => {
    const fields: any[] = [];

    // Información del mantenimiento
    fields.push({
      type: FieldType.INPUT,
      title: "Título del Mantenimiento",
      value: title,
      key: "title",
      inputType: InputType.TEXT,
      placeholder: "Ej: Cambio de aceite y filtros",
      required: true,
      validation: (value: string) => ({
        isValid: !!value.trim(),
        message: "El título es obligatorio",
      }),
    });

    // Categoría
    if (categorySearch.selectedCategory) {
      fields.push({
        type: FieldType.TEXT_FIXED,
        title: "Categoría:",
        value: categorySearch.selectedCategory.name || "",
        key: "categoryName",
      });
    } else {
      fields.push({
        type: FieldType.SEARCH,
        title: "Categoría",
        value: categorySearch.selectedCategory,
        key: "category",
        entityType: EntityType.CATEGORY,
        searchTerm: categorySearch.searchTerm,
        onSearchChange: categorySearch.searchCategories,
        availableEntities: categorySearch.availableCategories,
        showDropdown: categorySearch.showDropdown,
        onSelect: categorySearch.selectCategory,
        onDropdownToggle: categorySearch.setShowDropdown,
        placeholder: "Buscar categoría...",
        required: true,
      });
    }

    // Frecuencia
    fields.push(
      {
        type: FieldType.INPUT,
        title: "Frecuencia en Kilómetros",
        value: frequencyKm,
        key: "frequencyKm",
        inputType: InputType.NUMBER,
        placeholder: "10000",
        min: 1,
        required: true,
        validation: (value: number) => ({
          isValid: value > 0,
          message: "La frecuencia en kilómetros debe ser mayor a 0",
        }),
      },
      {
        type: FieldType.INPUT,
        title: "Frecuencia en Días",
        value: frequencyDays,
        key: "frequencyDays",
        inputType: InputType.NUMBER,
        placeholder: "365",
        min: 1,
        required: true,
        validation: (value: number) => ({
          isValid: value > 0,
          message: "La frecuencia en días debe ser mayor a 0",
        }),
      }
    );

    // Detalles adicionales
    fields.push(
      {
        type: FieldType.TEXTAREA,
        title: "Observaciones",
        value: observations,
        key: "observations",
        placeholder: "Observaciones adicionales...",
        rows: 3,
      },
      {
        type: FieldType.TEXTAREA,
        title: "Instrucciones",
        value: instructions,
        key: "instructions",
        placeholder: "Instrucciones detalladas para el mantenimiento...",
        rows: 4,
      }
    );

    return fields;
  };

  const formFields = buildFormFields();

  const buttonConfig = {
    primary: {
      text: saving
        ? "Guardando..."
        : isCreateMode
        ? "Crear Mantenimiento"
        : "Actualizar Mantenimiento",
      onClick: handleSave,
    },
    secondary: !isCreateMode
      ? {
          text: "Eliminar",
          onClick: handleDelete,
        }
      : undefined,
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
  };

  return (
    <>
      <FormLayout
        title={isCreateMode ? "Nuevo Mantenimiento" : "Editar Mantenimiento"}
        formFields={formFields}
        buttonConfig={buttonConfig}
        onFieldChange={handleFieldChange}
      />

      {/* Tabla de vehículos asignados - solo en modo edición */}
      {!isCreateMode && maintenanceId && (
        <div className="vehicles-table-section">
          <Table
            getRows={getVehiclesData}
            columns={vehicleColumns}
            title=""
            showEditColumn={true}
            customEditCell={(params) => (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // Navigate to edit maintenance assignment page
                  const vehicleId = params.row.id;
                  const assignmentId = params.row.assignmentId;

                  if (assignmentId) {
                    navigate(
                      `/edit-maintenance-assignment/${vehicleId}/${maintenanceId}/${assignmentId}?from=maintenance`
                    );
                  } else {
                    // Fallback if assignmentId is not available
                    navigate(
                      `/edit-maintenance-assignment/${vehicleId}/${maintenanceId}/auto?from=maintenance`
                    );
                  }
                }}
              >
                <PencilIcon />
              </span>
            )}
            showTableHeader={true}
            headerTitle={`Vehículos con mantenimiento: ${
              title || "Sin título"
            }`}
            showAddButton={true}
            addButtonText="+ Agregar Vehículo"
            onAddButtonClick={handleAddVehicle}
            maxHeight="600px"
            containerClassName="maintenance-vehicles-table"
          />
        </div>
      )}

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
