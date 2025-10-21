import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenancePossibles,
  getVehicleMaintenances,
  getMaintenancePossibleById,
  createMaintenanceAssignment,
  deleteMaintenanceAssignment,
  updateMaintenanceAssignment,
  type MaintenancePossibleNormalized,
} from "../../services/maintenances";

import { getAllMaintenanceRecords } from "../../services/maintenanceRecords";
import { getVehicleById } from "../../services/vehicles";
import {
  FormLayout,
  NotificationToast,
  ConfirmDialog,
  LoadingSpinner,
} from "../../components";
import type { FormField } from "../../components/FormLayout/FormLayout";
import {
  FieldType,
  EntityType,
  InputType,
} from "../../components/FormLayout/FormLayout";
import {
  useVehicleSearch,
  useMaintenanceSearch,
  useConfirmDialog,
} from "../../hooks";
import "./MaintenanceAssignment.css";
import Table from "../../components/Table/table";

export default function MaintenanceAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { maintenanceId, vehicleId, assignmentId } = useParams<{
    maintenanceId?: string;
    vehicleId?: string;
    assignmentId?: string;
  }>();

  // Support special case where assignmentId comes as "auto" and must be resolved
  const assignmentIdIsAuto = assignmentId === "auto";
  const [resolvedAssignmentId, setResolvedAssignmentId] = useState<
    string | null
  >(null);
  const effectiveAssignmentId = assignmentIdIsAuto
    ? resolvedAssignmentId
    : assignmentId || null;

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

  const handleFieldChange = (key: string, value: string | number) => {
    switch (key) {
      case "kilometersFrequency":
        const kmValue = Number(value);
        setKilometersFrequency(
          isNaN(kmValue) || kmValue === 0 ? null : kmValue
        );
        break;
      case "daysFrequency":
        const daysValue = Number(value);
        setDaysFrequency(
          isNaN(daysValue) || daysValue === 0 ? null : daysValue
        );
        break;
      case "observations":
        setObservations(value as string);
        break;
      case "instructions":
        setInstructions(value as string);
        break;
    }
  };

  // Helper function to normalize maintenance data
  const normalizeMaintenanceData = (
    maintenanceData: any,
    id: string
  ): MaintenancePossibleNormalized => ({
    id: maintenanceData.id || id,
    name: maintenanceData.name || maintenanceData.title || "Sin título",
    categoryName:
      maintenanceData.categoryName ||
      maintenanceData.categoryName ||
      maintenanceData.category_name ||
      "Sin categoría",
  });

  // Helper function for maintenance loading
  const loadMaintenanceFromAPI = async (
    id: string
  ): Promise<MaintenancePossibleNormalized | null> => {
    try {
      const resp = await getMaintenancePossibleById(id);
      if (resp.success && resp.data) {
        return normalizeMaintenanceData(resp.data, id);
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
        // Load vehicle and maintenance details first
        await Promise.all([loadVehicleData(), loadMaintenanceDataById()]);

        // Resolve assignment id if it comes as 'auto', then load assignment data
        if (assignmentIdIsAuto) {
          await resolveAssignmentId();
        }

        await loadCurrentAssignmentData();
      } catch (error) {
        console.error("Error loading edit mode data:", error);
        showError("Error al cargar los datos");
        setLoadingData(false);
      }
    };

    const loadCurrentAssignmentData = async () => {
      try {
        // Use service that attaches auth header
        const assignmentsResp = await getVehicleMaintenances(vehicleId!);
        if (assignmentsResp.success && assignmentsResp.data) {
          const assignments = assignmentsResp.data;
          let currentAssignment: any = null;

          if (Array.isArray(assignments)) {
            if (effectiveAssignmentId) {
              currentAssignment = assignments.find(
                (a: any) => a.id?.toString() === effectiveAssignmentId
              );
            }

            // If not found by id (or id is not resolved yet), try by maintenance pairing
            if (!currentAssignment && maintenanceId) {
              currentAssignment = assignments.find((a: any) => {
                const mid =
                  a.maintenanceId?.toString?.() ||
                  a.maintenance_id?.toString?.() ||
                  a.maintenance?.id?.toString?.();
                return mid === maintenanceId;
              });
            }
          } else {
            currentAssignment = assignments;
          }

          if (currentAssignment) {
            // Ensure we have an effective id for edit actions
            const foundId =
              currentAssignment.id?.toString?.() ||
              currentAssignment.assignmentId?.toString?.() ||
              null;
            if (!effectiveAssignmentId && foundId) {
              setResolvedAssignmentId(foundId);
            }

            const kmFreq =
              (currentAssignment as any).kilometersFrequency ||
              (currentAssignment as any).kilometers_frequency ||
              (currentAssignment as any).kilometers_freq;
            const daysFreq =
              (currentAssignment as any).daysFrequency ||
              (currentAssignment as any).days_frequency ||
              (currentAssignment as any).days_freq;

            if (kmFreq !== undefined) setKilometersFrequency(kmFreq);
            if (daysFreq !== undefined) setDaysFrequency(daysFreq);

            const assignObs =
              (currentAssignment as any).observations ||
              (currentAssignment as any).maintenance_observations ||
              (currentAssignment as any).observations_text ||
              "";
            const assignInstr =
              (currentAssignment as any).instructions ||
              (currentAssignment as any).maintenance_instructions ||
              (currentAssignment as any).instructions_text ||
              "";

            setObservations(assignObs || "");
            setInstructions(assignInstr || "");
          }
        } else {
          console.error(
            "Error loading assignment data:",
            assignmentsResp.message
          );
        }
      } catch (error) {
        console.error("Error loading current assignment data:", error);
      }
    };

    const resolveAssignmentId = async () => {
      try {
        if (!vehicleId || !maintenanceId) return;
        const assignmentsResp = await getVehicleMaintenances(vehicleId);
        if (assignmentsResp.success && Array.isArray(assignmentsResp.data)) {
          const found = assignmentsResp.data.find((a: any) => {
            const mid =
              a.maintenanceId?.toString?.() ||
              a.maintenance_id?.toString?.() ||
              a.maintenance?.id?.toString?.();
            return mid === maintenanceId;
          });
          if (found) {
            const id =
              found.id?.toString?.() || found.assignmentId?.toString?.();
            if (id) setResolvedAssignmentId(id);
          } else {
            showError(
              "No se pudo resolver la asignación para este mantenimiento y vehículo"
            );
          }
        }
      } catch (e) {
        console.error("Error resolving assignment id:", e);
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
        // Try to load the maintenance with full details (frequencies + details)
        const resp = await getMaintenancePossibleById(maintenanceId!);

        if (resp.success && resp.data) {
          const full = resp.data;
          // set minimal maintenanceData for display in lists
          setMaintenanceData({
            id: full.id,
            name: full.title || full.id,
            categoryName: full.categoryName || full.categoryId || "",
          });

          // Prefill frequencies and details from the maintenance defaults
          if (full.frequencyKm !== undefined && full.frequencyKm !== null)
            setKilometersFrequency(full.frequencyKm);
          if (full.frequencyDays !== undefined && full.frequencyDays !== null)
            setDaysFrequency(full.frequencyDays);
          if (full.observations !== undefined)
            setObservations(full.observations || "");
          if (full.instructions !== undefined)
            setInstructions(full.instructions || "");
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
          return;
        }
      }

      // Create maintenance assignment via service (adds auth headers)
      const payload = {
        vehicleId: vehicleSearch.selectedVehicle!.id,
        maintenanceId: currentMaintenanceId,
        kilometersFrequency: kilometersFrequency ?? 0,
        daysFrequency: daysFrequency ?? 0,
        observations: observations || undefined,
        instructions: instructions || undefined,
      };

      const response = await createMaintenanceAssignment(payload);

      if (!response.success) {
        throw new Error(response.message || "Error creando asignación");
      }

      showSuccess("Mantenimiento asignado exitosamente");
      setTimeout(() => navigate(getNavigationUrl()), 1500);
    } catch (error) {
      console.error("Error creating maintenance assignment:", error);
      showError("Error al asignar mantenimiento");
    }
  };

  const handleUpdate = async () => {
    const targetAssignmentId = assignmentIdIsAuto
      ? resolvedAssignmentId || undefined
      : assignmentId;
    if (!targetAssignmentId) {
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

    try {
      const updateData = {
        kilometersFrequency: kilometersFrequency ?? 0,
        daysFrequency: daysFrequency ?? 0,
        observations: observations || undefined,
        instructions: instructions || undefined,
      };

      const response = await updateMaintenanceAssignment(
        targetAssignmentId,
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
    }
  };

  const handleDelete = async () => {
    const targetAssignmentId = assignmentIdIsAuto
      ? resolvedAssignmentId || undefined
      : assignmentId;
    if (!targetAssignmentId) {
      showError("ID de asignación no válido");
      return;
    }

    showConfirm(
      "¿Está seguro que desea eliminar esta asignación de mantenimiento?",
      async () => {
        try {
          const response = await deleteMaintenanceAssignment(
            targetAssignmentId
          );

          if (response.success) {
            showSuccess("Asignación eliminada exitosamente");
            setTimeout(() => navigate(getNavigationUrl()), 1500);
          } else {
            showError(response.message || "Error al eliminar la asignación");
          }
        } catch (error) {
          console.error("Error deleting maintenance assignment:", error);
          showError("Error al eliminar la asignación de mantenimiento");
        }
      }
    );
  };

  const handleCancel = () => {
    navigate(getNavigationUrl());
  };

  const buildFormFields = (): FormField[] => {
    const fields: FormField[] = [];

    // Edit Mode: Show both vehicle and maintenance data (disabled)
    if (isEditMode) {
      // Vehicle data section
      if (vehicleSearch.selectedVehicle) {
        fields.push(
          {
            type: FieldType.TEXT_FIXED,
            key: "vehiclePatente",
            title: "Patente del Vehículo:",
            value: vehicleSearch.selectedVehicle.licensePlate || "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "vehicleMarca",
            title: "Marca:",
            value:
              (vehicleSearch.selectedVehicle as any).brandName ||
              vehicleSearch.selectedVehicle.brand ||
              vehicleSearch.selectedVehicle.modelObj?.brand?.name ||
              "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "vehicleModelo",
            title: "Modelo:",
            value:
              (vehicleSearch.selectedVehicle as any).modelName ||
              vehicleSearch.selectedVehicle.model ||
              vehicleSearch.selectedVehicle.modelObj?.name ||
              "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "vehicleAnio",
            title: "Año:",
            value: vehicleSearch.selectedVehicle.year?.toString() || "",
          }
        );
      }

      // Maintenance data section
      if (maintenanceSearch.selectedMaintenance) {
        fields.push({
          type: FieldType.TEXT_FIXED,
          key: "maintenanceName",
          title: "Mantenimiento Asignado:",
          value: maintenanceSearch.selectedMaintenance.name || "",
        });
      }
    }

    // First section: Show information about the preloaded entity
    if (isMaintenanceToVehicle && maintenanceData) {
      fields.push({
        type: FieldType.TEXT_FIXED,
        key: "maintenanceTitle",
        title: "Título del Mantenimiento:",
        value: maintenanceData?.name || "",
      });
    }

    // For vehicle-to-maintenance: show vehicle data (grayed out/disabled)
    if (isVehicleToMaintenance && vehicleSearch.selectedVehicle) {
      fields.push(
        {
          type: FieldType.TEXT_FIXED,
          key: "vehiclePatente",
          title: "Patente del Vehículo:",
          value: vehicleSearch.selectedVehicle.licensePlate || "",
        },
        {
          type: FieldType.TEXT_FIXED,
          key: "vehicleMarca",
          title: "Marca:",
          value:
            (vehicleSearch.selectedVehicle as any).brandName ||
            vehicleSearch.selectedVehicle.brand ||
            vehicleSearch.selectedVehicle.modelObj?.brand?.name ||
            "",
        },
        {
          type: FieldType.TEXT_FIXED,
          key: "vehicleModelo",
          title: "Modelo:",
          value:
            (vehicleSearch.selectedVehicle as any).modelName ||
            vehicleSearch.selectedVehicle.model ||
            vehicleSearch.selectedVehicle.modelObj?.name ||
            "",
        },
        {
          type: FieldType.TEXT_FIXED,
          key: "vehicleAnio",
          title: "Año:",
          value: vehicleSearch.selectedVehicle.year?.toString() || "",
        }
      );
    }

    // Second section: Search for the other entity
    // For maintenance-to-vehicle: search vehicles
    if (isMaintenanceToVehicle) {
      if (vehicleSearch.selectedVehicle) {
        fields.push(
          {
            type: FieldType.TEXT_FIXED,
            key: "selectedVehiclePatente",
            title: "Patente del Vehículo:",
            value: vehicleSearch.selectedVehicle.licensePlate || "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "selectedVehicleMarca",
            title: "Marca:",
            value:
              (vehicleSearch.selectedVehicle as any).brandName ||
              vehicleSearch.selectedVehicle.brand ||
              vehicleSearch.selectedVehicle.modelObj?.brand?.name ||
              "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "selectedVehicleModelo",
            title: "Modelo:",
            value:
              (vehicleSearch.selectedVehicle as any).modelName ||
              vehicleSearch.selectedVehicle.model ||
              vehicleSearch.selectedVehicle.modelObj?.name ||
              "",
          },
          {
            type: FieldType.TEXT_FIXED,
            key: "selectedVehicleAnio",
            title: "Año:",
            value: vehicleSearch.selectedVehicle.year?.toString() || "",
          }
        );
      } else {
        fields.push({
          type: FieldType.SEARCH,
          entityType: EntityType.VEHICLE,
          key: "vehicle",
          title: "Vehículo:",
          value: null,
          placeholder: "Buscar vehículo por patente, marca o modelo...",
          required: true,
        });
      }
    }

    // For vehicle-to-maintenance: search maintenances
    if (isVehicleToMaintenance) {
      if (maintenanceSearch.selectedMaintenance) {
        fields.push({
          type: FieldType.TEXT_FIXED,
          key: "selectedMaintenanceName",
          title: "Mantenimiento Seleccionado:",
          value: maintenanceSearch.selectedMaintenance.name || "",
        });
      } else {
        fields.push({
          type: FieldType.SEARCH,
          entityType: EntityType.MAINTENANCE,
          key: "maintenance",
          title: "Mantenimiento:",
          value: null,
          placeholder: "Buscar mantenimiento...",
          required: true,
        });
      }
    }

    // Agregar las secciones restantes
    fields.push(
      {
        type: FieldType.INPUT,
        inputType: InputType.NUMBER,
        key: "kilometersFrequency",
        title: "Frecuencia en Kilómetros:",
        value: kilometersFrequency ?? "",
        placeholder: "Ingrese kilómetros (obligatorio si no especifica días)",
        min: 1,
        required: daysFrequency === null || daysFrequency <= 0,
        validation: (value: any) => {
          const numValue = Number(value);
          if (daysFrequency === null || daysFrequency <= 0) {
            if (isNaN(numValue) || numValue <= 0) {
              return {
                isValid: false,
                message: "Debe especificar kilómetros o días",
              };
            }
          }
          return { isValid: true };
        },
      },
      {
        type: FieldType.INPUT,
        inputType: InputType.NUMBER,
        key: "daysFrequency",
        title: "Frecuencia en Días:",
        value: daysFrequency ?? "",
        placeholder: "Ingrese días (obligatorio si no especifica kilómetros)",
        min: 1,
        required: kilometersFrequency === null || kilometersFrequency <= 0,
        validation: (value: any) => {
          const numValue = Number(value);
          if (kilometersFrequency === null || kilometersFrequency <= 0) {
            if (isNaN(numValue) || numValue <= 0) {
              return {
                isValid: false,
                message: "Debe especificar kilómetros o días",
              };
            }
          }
          return { isValid: true };
        },
      },
      {
        type: FieldType.TEXTAREA,
        key: "observations",
        title: "Observaciones:",
        value: observations,
        placeholder: "Observaciones adicionales...",
      },
      {
        type: FieldType.TEXTAREA,
        key: "instructions",
        title: "Instrucciones:",
        value: instructions,
        placeholder: "Instrucciones para el mantenimiento...",
      }
    );

    return fields;
  };

  const formFields = buildFormFields();

  const buttonConfig = {
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
    ...(isEditMode
      ? {
          primary: {
            text: "Guardar Cambios",
            onClick: handleUpdate,
          },
          secondary: {
            text: "Eliminar Asignación",
            onClick: handleDelete,
          },
        }
      : {
          primary: {
            text: "Asignar Mantenimiento",
            onClick: handleSubmit,
          },
        }),
  };

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
          <FormLayout
            title={getPageTitle()}
            formFields={formFields}
            buttonConfig={buttonConfig}
            onFieldChange={handleFieldChange}
            className="maintenance-assignment"
          />

          {/* Maintenance records history (edit mode) */}
          {isEditMode && (
            <div style={{ marginTop: 24 }}>
              <Table
                columns={[
                  {
                    field: "date",
                    headerName: "Fecha",
                    width: 150,
                    headerAlign: "center",
                    align: "center",
                    renderCell: (params) => {
                      if (params.row.date) {
                        const date = new Date(params.row.date);
                        return date.toLocaleDateString("es-AR");
                      }
                      return "Sin fecha";
                    },
                  },
                  {
                    field: "kilometers",
                    headerName: "Kilómetros",
                    width: 150,
                    headerAlign: "center",
                    align: "center",
                    renderCell: (params) => {
                      const km = params.row.kilometers;
                      return km ? `${km.toLocaleString()} km` : "N/A";
                    },
                  },
                  {
                    field: "notes",
                    headerName: "Observaciones",
                    width: 300,
                    flex: 1,
                    renderCell: (params) =>
                      params.row.notes || "Sin observaciones",
                  },
                ]}
                getRows={async (_pagination) => {
                  try {
                    if (vehicleId && maintenanceId) {
                      const resp = await getAllMaintenanceRecords({
                        vehicleId,
                        maintenanceId,
                      });

                      if (resp.success) {
                        const items = resp.data?.items ?? [];
                        const mapped = items.map((r, i) => ({
                          id: r.id || `mr-${i}`,
                          ...r,
                        }));
                        return { success: true, data: mapped };
                      }
                    }

                    return { success: false, data: [] };
                  } catch (error) {
                    console.error(error);
                    return { success: false, data: [] };
                  }
                }}
                title=""
                showTableHeader
                headerTitle="Historial de mantenimientos"
                maxWidth="1200px"
                tableWidth="1200px"
                showAddButton={true}
                addButtonText="+ Agregar Registro"
                onAddButtonClick={() => {
                  if (vehicleId && maintenanceId && effectiveAssignmentId) {
                    navigate(
                      `/maintenance-record-register-edit/${vehicleId}/${maintenanceId}/${effectiveAssignmentId}`
                    );
                  }
                }}
              />
            </div>
          )}
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
