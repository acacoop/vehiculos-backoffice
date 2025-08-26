import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenancePossibles,
  getVehicleMaintenances,
  deleteMaintenanceAssignment,
  updateMaintenanceAssignment,
  type MaintenancePossibleNormalized,
} from "../../services/maintenances";
import { getVehicleById } from "../../services/vehicles";
import {
  FormLayout,
  NotificationToast,
  CancelButton,
  ConfirmButton,
  ButtonGroup,
  DeleteButton,
  ConfirmDialog,
  LoadingSpinner,
} from "../../components";
import type { FormSection } from "../../components";
import {
  useVehicleSearch,
  useMaintenanceSearch,
  useConfirmDialog,
} from "../../hooks";
import { API_CONFIG } from "../../common";
import "./MaintenanceAssignment.css";

export default function MaintenanceAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { maintenanceId, vehicleId, assignmentId } = useParams<{
    maintenanceId?: string;
    vehicleId?: string;
    assignmentId?: string;
  }>();

  // Get the 'from' parameter to know where the user came from
  const searchParams = new URLSearchParams(location.search);
  const fromPage = searchParams.get("from"); // 'vehicle' or 'maintenance'

  // Determine the flow: maintenance-to-vehicle, vehicle-to-maintenance, or edit existing
  const isMaintenanceToVehicle = !!maintenanceId && !vehicleId && !assignmentId;
  const isVehicleToMaintenance = !!vehicleId && !maintenanceId && !assignmentId;
  const isEditMode = !!vehicleId && !!maintenanceId && !!assignmentId;

  const [maintenanceData, setMaintenanceData] =
    useState<MaintenancePossibleNormalized | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [kilometersFrequency, setKilometersFrequency] = useState<number | null>(
    null
  );
  const [daysFrequency, setDaysFrequency] = useState<number | null>(null);
  const [observations, setObservations] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Use search hooks
  const vehicleSearch = useVehicleSearch();
  const maintenanceSearch = useMaintenanceSearch();

  // Use confirmation dialog
  const {
    isOpen: isConfirmOpen,
    message: confirmMessage,
    showConfirm,
    handleConfirm,
    handleCancel: handleConfirmCancel,
  } = useConfirmDialog();

  // Helper functions for form sections
  const createVehicleFields = (vehicle: any, disabled = true) => [
    {
      key: "patente",
      label: "Patente:",
      type: "text" as const,
      value: vehicle.licensePlate || "",
      onChange: () => {},
      disabled,
    },
    {
      key: "marca",
      label: "Marca:",
      type: "text" as const,
      value: vehicle.brand || "",
      onChange: () => {},
      disabled,
    },
    {
      key: "modelo",
      label: "Modelo:",
      type: "text" as const,
      value: vehicle.model || "",
      onChange: () => {},
      disabled,
    },
    {
      key: "anio",
      label: "Año:",
      type: "text" as const,
      value: vehicle.year?.toString() || "",
      onChange: () => {},
      disabled,
    },
  ];

  // Helper function to normalize maintenance data
  const normalizeMaintenanceData = (
    maintenanceData: any,
    id: string
  ): MaintenancePossibleNormalized => ({
    id: maintenanceData.id || id,
    name: maintenanceData.name || maintenanceData.title || "Sin título",
    maintenanceCategoryName:
      maintenanceData.maintenanceCategoryName ||
      maintenanceData.categoryName ||
      maintenanceData.category_name ||
      "Sin categoría",
  });

  // Helper function for maintenance loading
  const loadMaintenanceFromAPI = async (
    id: string
  ): Promise<MaintenancePossibleNormalized | null> => {
    try {
      const directResponse = await fetch(
        `${API_CONFIG.BASE_URL}/maintenance/posibles/${id}`
      );

      if (directResponse.ok) {
        const apiResponse = await directResponse.json();
        const maintenanceData = apiResponse.data || apiResponse;

        if (
          maintenanceData &&
          (maintenanceData.id || maintenanceData.name || maintenanceData.title)
        ) {
          return normalizeMaintenanceData(maintenanceData, id);
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading maintenance data by ID:", error);
      return null;
    }
  };

  // Helper function for validation
  const validateAssignment = (): string | null => {
    if (!vehicleSearch.selectedVehicle) {
      return "Debe seleccionar un vehículo";
    }

    // Determine maintenance ID based on flow
    const currentMaintenanceId = getCurrentMaintenanceId();

    if (!currentMaintenanceId) {
      return "Debe seleccionar un mantenimiento";
    }

    if (
      (kilometersFrequency === null || kilometersFrequency <= 0) &&
      (daysFrequency === null || daysFrequency <= 0)
    ) {
      return "Debe especificar al menos una frecuencia (kilómetros o días)";
    }

    return null;
  };

  // Helper function to get current maintenance ID
  const getCurrentMaintenanceId = (): string | null => {
    if (isMaintenanceToVehicle && maintenanceId) {
      return maintenanceId;
    } else if (
      isVehicleToMaintenance &&
      maintenanceSearch.selectedMaintenance
    ) {
      return maintenanceSearch.selectedMaintenance.id.toString();
    }
    return null;
  };

  // Helper function for navigation
  const getNavigationUrl = (): string => {
    if (isEditMode) {
      if (fromPage === "maintenance" && maintenanceId) {
        return `/maintenance/edit/${maintenanceId}`;
      } else if (fromPage === "vehicle" && vehicleId) {
        return `/vehicle/edit/${vehicleId}`;
      } else if (vehicleId) {
        return `/vehicle/edit/${vehicleId}`;
      } else {
        return "/vehicles";
      }
    } else if (isMaintenanceToVehicle && maintenanceId) {
      return `/maintenance/edit/${maintenanceId}`;
    } else if (isVehicleToMaintenance && vehicleId) {
      return `/vehicle/edit/${vehicleId}`;
    } else {
      return "/vehicles";
    }
  };

  const showError = (message: string) => {
    setNotification({ isOpen: true, message, type: "error" });
  };

  const showSuccess = (message: string) => {
    setNotification({ isOpen: true, message, type: "success" });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  // Load maintenance data
  useEffect(() => {
    const loadData = async () => {
      if (isMaintenanceToVehicle && maintenanceId) {
        await loadMaintenanceData();
      } else if (isVehicleToMaintenance && vehicleId) {
        await loadVehicleData();
      } else if (isEditMode && vehicleId && maintenanceId) {
        await loadEditModeData();
      } else {
        showError("Parámetros de URL no válidos");
        setLoadingData(false);
      }
    };

    const loadEditModeData = async () => {
      try {
        // Load both vehicle and maintenance data, and current assignment data
        await Promise.all([
          loadVehicleData(),
          loadMaintenanceDataById(),
          loadCurrentAssignmentData(),
        ]);
      } catch (error) {
        console.error("Error loading edit mode data:", error);
        showError("Error al cargar los datos");
        setLoadingData(false);
      }
    };

    const loadCurrentAssignmentData = async () => {
      try {
        // Get all assignments for the vehicle and find the specific one
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/maintenance/assignments/${vehicleId}`
        );

        if (response.ok) {
          const assignmentData = await response.json();

          // Find the specific assignment
          const assignments = assignmentData.data || assignmentData;
          const currentAssignment = Array.isArray(assignments)
            ? assignments.find((a) => a.id === assignmentId)
            : assignments;

          if (currentAssignment) {
            // Try both camelCase and snake_case field names
            const kmFreq =
              currentAssignment.kilometersFrequency ||
              currentAssignment.kilometers_frequency;
            const daysFreq =
              currentAssignment.daysFrequency ||
              currentAssignment.days_frequency;

            if (kmFreq !== undefined) {
              setKilometersFrequency(kmFreq);
            }
            if (daysFreq !== undefined) {
              setDaysFrequency(daysFreq);
            }
            // Load any assignment-level observations/instructions or joined maintenance fields
            const assignObs =
              currentAssignment.observations ||
              currentAssignment.maintenance_observations ||
              currentAssignment.observations_text ||
              currentAssignment.notes ||
              "";
            const assignInstr =
              currentAssignment.instructions ||
              currentAssignment.maintenance_instructions ||
              currentAssignment.instructions_text ||
              "";

            setObservations(assignObs || "");
            setInstructions(assignInstr || "");
          }
        } else {
          console.error("Error loading assignment data:", response.status);
        }
      } catch (error) {
        console.error("Error loading current assignment data:", error);
      }
    };

    const loadMaintenanceDataById = async () => {
      const data = await loadMaintenanceFromAPI(maintenanceId!);
      if (data) {
        maintenanceSearch.selectMaintenance({
          id: data.id,
          name: data.name,
        } as any);
        setMaintenanceData(data);
        // If the maintenance payload contains default observations/instructions, use them
        const obs =
          (data as any).observations ||
          (data as any).maintenance_observations ||
          (data as any).observacion ||
          "";
        const instr =
          (data as any).instructions ||
          (data as any).maintenance_instructions ||
          (data as any).instruction ||
          "";
        if (obs) setObservations(obs);
        if (instr) setInstructions(instr);
      }
    };

    const loadMaintenanceData = async () => {
      try {
        // Try to get the specific maintenance directly
        const data = await loadMaintenanceFromAPI(maintenanceId!);

        if (data) {
          setMaintenanceData(data);
        } else {
          // Fallback: Get all maintenance possibles and find the specific one
          const response = await getMaintenancePossibles();

          if (response.success && response.data) {
            const specificMaintenance = response.data.find(
              (m) => m.id === maintenanceId
            );

            if (specificMaintenance) {
              setMaintenanceData(specificMaintenance);
            } else {
              showError(
                `No se encontró el mantenimiento con ID: ${maintenanceId}. IDs disponibles: ${response.data
                  .map((m) => m.id)
                  .join(", ")}`
              );
            }
          } else {
            showError(response.message || "Error al cargar los mantenimientos");
          }
        }
      } catch (error) {
        console.error("Error loading maintenance data:", error);
        showError("Error al cargar el mantenimiento");
      } finally {
        setLoadingData(false);
      }
    };

    const loadVehicleData = async () => {
      try {
        const response = await getVehicleById(vehicleId!);

        if (response.success && response.data) {
          // Pre-select the vehicle in the vehicle search
          vehicleSearch.selectVehicle(response.data);
        } else {
          showError(`No se encontró el vehículo con ID: ${vehicleId}`);
        }
      } catch (error) {
        console.error("Error loading vehicle data:", error);
        showError("Error al cargar el vehículo");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [
    maintenanceId,
    vehicleId,
    assignmentId,
    isMaintenanceToVehicle,
    isVehicleToMaintenance,
    isEditMode,
  ]);

  const handleSubmit = async () => {
    const validationError = validateAssignment();
    if (validationError) {
      showError(validationError);
      return;
    }

    const currentMaintenanceId = getCurrentMaintenanceId()!;

    setLoading(true);
    try {
      // First, check if the maintenance is already assigned to this vehicle
      const existingMaintenances = await getVehicleMaintenances(
        vehicleSearch.selectedVehicle!.id.toString()
      );

      if (existingMaintenances.success && existingMaintenances.data) {
        // Check if this maintenance is already assigned
        const isAlreadyAssigned = existingMaintenances.data.some(
          (assignment: any) =>
            assignment.maintenance_id?.toString() === currentMaintenanceId ||
            assignment.maintenanceId?.toString() === currentMaintenanceId ||
            assignment.id?.toString() === currentMaintenanceId
        );

        if (isAlreadyAssigned) {
          showError(
            "Este mantenimiento ya se encuentra asignado a este vehículo"
          );
          setLoading(false);
          return;
        }
      }

      // Create maintenance assignment directly via API
      // Match the exact structure expected by the API as shown in Swagger
      const assignmentData = {
        vehicleId: vehicleSearch.selectedVehicle!.id,
        maintenanceId: currentMaintenanceId,
        kilometersFrequency: kilometersFrequency ?? 0,
        daysFrequency: daysFrequency ?? 0,
        observations: observations || undefined,
        instructions: instructions || undefined,
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/maintenance/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assignmentData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al crear la asignación de mantenimiento: ${response.status}`
        );
      }

      await response.json();
      showSuccess("Mantenimiento asignado exitosamente");
      setTimeout(() => navigate(getNavigationUrl()), 1500);
    } catch (error) {
      console.error("Error creating maintenance assignment:", error);
      showError("Error al asignar mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!assignmentId) {
      showError("ID de asignación no válido");
      return;
    }

    if (
      (kilometersFrequency === null || kilometersFrequency <= 0) &&
      (daysFrequency === null || daysFrequency <= 0)
    ) {
      showError("Debe especificar al menos una frecuencia (kilómetros o días)");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        kilometersFrequency: kilometersFrequency ?? 0,
        daysFrequency: daysFrequency ?? 0,
        observations: observations || undefined,
        instructions: instructions || undefined,
      };

      const response = await updateMaintenanceAssignment(
        assignmentId,
        updateData
      );

      if (response.success) {
        showSuccess("Asignación actualizada exitosamente");
        setTimeout(() => {
          navigate(getNavigationUrl());
        }, 1500);
      } else {
        showError(response.message || "Error al actualizar la asignación");
      }
    } catch (error) {
      console.error("Error updating maintenance assignment:", error);
      showError("Error al actualizar la asignación de mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentId) {
      showError("ID de asignación no válido");
      return;
    }

    showConfirm(
      "¿Está seguro que desea eliminar esta asignación de mantenimiento?",
      async () => {
        setLoading(true);
        try {
          const response = await deleteMaintenanceAssignment(assignmentId);

          if (response.success) {
            showSuccess("Asignación eliminada exitosamente");
            setTimeout(() => navigate(getNavigationUrl()), 1500);
          } else {
            showError(response.message || "Error al eliminar la asignación");
          }
        } catch (error) {
          console.error("Error deleting maintenance assignment:", error);
          showError("Error al eliminar la asignación de mantenimiento");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleCancel = () => {
    navigate(getNavigationUrl());
  };

  const formSections: FormSection[] = [];

  // Edit Mode: Show both vehicle and maintenance data (disabled)
  if (isEditMode) {
    // Vehicle data section
    if (vehicleSearch.selectedVehicle) {
      formSections.push({
        title: "Datos del Vehículo",
        horizontal: true,
        fields: createVehicleFields(vehicleSearch.selectedVehicle),
      });
    }

    // Maintenance data section
    if (maintenanceSearch.selectedMaintenance) {
      formSections.push({
        title: "Mantenimiento Asignado",
        fields: [
          {
            key: "maintenanceName",
            label: "Mantenimiento:",
            type: "text",
            value: maintenanceSearch.selectedMaintenance.name || "",
            onChange: () => {},
            disabled: true,
          },
        ],
      });
    }
  }

  // First section: Show information about the preloaded entity
  if (isMaintenanceToVehicle && maintenanceData) {
    formSections.push({
      title: "Información del Mantenimiento",
      fields: [
        {
          key: "maintenanceTitle",
          label: "Título del Mantenimiento",
          type: "text",
          value: maintenanceData?.name || "",
          onChange: () => {},
          readOnly: true,
        },
      ],
    });
  }

  // For vehicle-to-maintenance: show vehicle data (grayed out/disabled)
  if (isVehicleToMaintenance && vehicleSearch.selectedVehicle) {
    formSections.push({
      title: "Datos del Vehículo",
      horizontal: true,
      fields: createVehicleFields(vehicleSearch.selectedVehicle),
    });
  }

  // Second section: Search for the other entity
  // For maintenance-to-vehicle: search vehicles
  if (isMaintenanceToVehicle) {
    if (vehicleSearch.selectedVehicle) {
      formSections.push({
        title: "Datos del Vehículo",
        horizontal: true,
        actionButton: {
          text: "Cambiar vehículo",
          onClick: () => vehicleSearch.clearSelection(),
        },
        fields: createVehicleFields(vehicleSearch.selectedVehicle),
      });
    } else {
      formSections.push({
        title: "Seleccionar Vehículo",
        fields: [
          {
            key: "vehicle",
            label: "Vehículo",
            type: "vehicleSearch",
            value: "",
            onChange: () => {},
            placeholder: "Buscar vehículo por patente, marca o modelo...",
            required: true,
            entitySearch: true,
            searchTerm: vehicleSearch.searchTerm,
            onSearchChange: vehicleSearch.searchVehicles,
            availableVehicles: vehicleSearch.availableVehicles,
            showDropdown: vehicleSearch.showDropdown,
            onVehicleSelect: vehicleSearch.selectVehicle,
            onDropdownToggle: vehicleSearch.setShowDropdown,
          },
        ],
      });
    }
  }

  // For vehicle-to-maintenance: search maintenances
  if (isVehicleToMaintenance) {
    if (maintenanceSearch.selectedMaintenance) {
      formSections.push({
        title: "Mantenimiento Seleccionado",
        horizontal: true,
        actionButton: {
          text: "Cambiar mantenimiento",
          onClick: () => maintenanceSearch.clearSelection(),
        },
        fields: [
          {
            key: "maintenanceName",
            label: "Mantenimiento:",
            type: "text",
            value: maintenanceSearch.selectedMaintenance.name || "",
            onChange: () => {},
            disabled: true,
          },
        ],
      });
    } else {
      formSections.push({
        title: "Seleccionar Mantenimiento",
        fields: [
          {
            key: "maintenance",
            label: "Mantenimiento",
            type: "maintenanceSearch",
            value: "",
            onChange: () => {},
            placeholder: "Buscar mantenimiento...",
            required: true,
            entitySearch: true,
            searchTerm: maintenanceSearch.searchTerm,
            onSearchChange: maintenanceSearch.searchMaintenances,
            availableMaintenances: maintenanceSearch.availableMaintenances,
            showDropdown: maintenanceSearch.showDropdown,
            onMaintenanceSelect: maintenanceSearch.selectMaintenance,
            onDropdownToggle: maintenanceSearch.setShowDropdown,
          },
        ],
      });
    }
  }

  // Agregar las secciones restantes
  formSections.push({
    title: "Configuración de Frecuencia",
    horizontal: true,
    fields: [
      {
        key: "kilometersFrequency",
        label: "Frecuencia en Kilómetros",
        type: "number",
        value: kilometersFrequency ?? "",
        onChange: (_key: string, value: string | number) => {
          const numValue = Number(value);
          setKilometersFrequency(
            isNaN(numValue) || numValue === 0 ? null : numValue
          );
        },
        min: 1,
        placeholder: "Ingrese kilómetros (obligatorio si no especifica días)",
        required: daysFrequency === null || daysFrequency <= 0,
      },
      {
        key: "daysFrequency",
        label: "Frecuencia en Días",
        type: "number",
        value: daysFrequency ?? "",
        onChange: (_key: string, value: string | number) => {
          const numValue = Number(value);
          setDaysFrequency(isNaN(numValue) || numValue === 0 ? null : numValue);
        },
        min: 1,
        placeholder: "Ingrese días (obligatorio si no especifica kilómetros)",
        required: kilometersFrequency === null || kilometersFrequency <= 0,
      },
    ],
  });

  // Details: observations and instructions (editable when assigning)
  formSections.push({
    title: "Detalles del Mantenimiento",
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
        placeholder: "Instrucciones para el mantenimiento...",
      },
    ],
  });

  const getPageTitle = () => {
    if (isEditMode) {
      return "Editar Asignación de Mantenimiento";
    } else if (isMaintenanceToVehicle) {
      return "Asignar Mantenimiento a Vehículo";
    } else if (isVehicleToMaintenance) {
      return "Asignar Mantenimiento al Vehículo";
    }
    return "Asignar Mantenimiento";
  };

  const getLoadingText = () => {
    if (isEditMode) {
      return "Cargando datos de la asignación...";
    } else if (isMaintenanceToVehicle) {
      return "Cargando datos del mantenimiento...";
    } else if (isVehicleToMaintenance) {
      return "Cargando datos del vehículo...";
    }
    return "Cargando datos...";
  };

  return (
    <>
      {loadingData ? (
        <LoadingSpinner message={getLoadingText()} />
      ) : (
        <div className="maintenance-assignment-container">
          <FormLayout title={getPageTitle()} sections={formSections}>
            <ButtonGroup>
              <CancelButton text="Cancelar" onClick={handleCancel} />
              {isEditMode ? (
                <>
                  <ConfirmButton
                    text="Guardar Cambios"
                    onClick={handleUpdate}
                    loading={loading}
                  />
                  <DeleteButton
                    text="Eliminar Asignación"
                    onClick={handleDelete}
                    loading={loading}
                  />
                </>
              ) : (
                <ConfirmButton
                  text="Asignar Mantenimiento"
                  onClick={handleSubmit}
                  loading={loading}
                />
              )}
            </ButtonGroup>
          </FormLayout>
        </div>
      )}

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleConfirmCancel}
      />
    </>
  );
}
