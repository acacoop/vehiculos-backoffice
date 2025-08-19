import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenancePossibles,
  type MaintenancePossibleNormalized,
} from "../../services/maintenances";
import { getVehicleById } from "../../services/vehicles";
import {
  FormLayout,
  NotificationToast,
  CancelButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components";
import type { FormSection } from "../../components";
import { useVehicleSearch, useMaintenanceSearch } from "../../hooks";
import { API_CONFIG } from "../../common";
import "./MaintenanceAssignment.css";

export default function MaintenanceAssignment() {
  const navigate = useNavigate();
  const { maintenanceId, vehicleId } = useParams<{
    maintenanceId?: string;
    vehicleId?: string;
  }>();

  // Determine the flow: maintenance-to-vehicle or vehicle-to-maintenance
  const isMaintenanceToVehicle = !!maintenanceId;
  const isVehicleToMaintenance = !!vehicleId;

  const [maintenanceData, setMaintenanceData] =
    useState<MaintenancePossibleNormalized | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [kilometersFrequency, setKilometersFrequency] = useState<number>(0);
  const [daysFrequency, setDaysFrequency] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Use search hooks
  const vehicleSearch = useVehicleSearch();
  const maintenanceSearch = useMaintenanceSearch();

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
      } else {
        showError("Parámetros de URL no válidos");
        setLoadingData(false);
      }
    };

    const loadMaintenanceData = async () => {
      try {
        // First try to get the specific maintenance directly
        const directResponse = await fetch(
          `${API_CONFIG.BASE_URL}/maintenance/posibles/${maintenanceId}`
        );

        if (directResponse.ok) {
          const apiResponse = await directResponse.json();

          // Handle the API response structure {status: 'success', data: {...}}
          const maintenanceData = apiResponse.data || apiResponse;

          if (
            maintenanceData &&
            (maintenanceData.id ||
              maintenanceData.name ||
              maintenanceData.title)
          ) {
            setMaintenanceData({
              id: maintenanceData.id || maintenanceId,
              name:
                maintenanceData.name || maintenanceData.title || "Sin título",
              maintenanceCategoryName:
                maintenanceData.maintenanceCategoryName ||
                maintenanceData.categoryName ||
                maintenanceData.category_name ||
                "Sin categoría",
            });
          } else {
            throw new Error("Datos de mantenimiento inválidos");
          }
        } else {
          // Fallback: Get all maintenance possibles and find the specific one
          const response = await getMaintenancePossibles();

          if (response.success && response.data) {
            // Find the specific maintenance by ID
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
          setVehicleData(response.data);
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
    isMaintenanceToVehicle,
    isVehicleToMaintenance,
  ]);

  const handleSubmit = async () => {
    if (!vehicleSearch.selectedVehicle) {
      showError("Debe seleccionar un vehículo");
      return;
    }

    // Determine maintenance ID based on flow
    let currentMaintenanceId: string;
    if (isMaintenanceToVehicle && maintenanceId) {
      currentMaintenanceId = maintenanceId;
    } else if (
      isVehicleToMaintenance &&
      maintenanceSearch.selectedMaintenance
    ) {
      currentMaintenanceId =
        maintenanceSearch.selectedMaintenance.id.toString();
    } else {
      showError("Debe seleccionar un mantenimiento");
      return;
    }

    if (kilometersFrequency <= 0 && daysFrequency <= 0) {
      showError("Debe especificar al menos una frecuencia (kilómetros o días)");
      return;
    }

    setLoading(true);
    try {
      // Create maintenance assignment directly via API
      // Match the exact structure expected by the API as shown in Swagger
      const assignmentData = {
        vehicleId: vehicleSearch.selectedVehicle.id,
        maintenanceId: currentMaintenanceId,
        kilometersFrequency: kilometersFrequency || 0,
        daysFrequency: daysFrequency || 0,
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
      setTimeout(() => {
        navigate(`/maintenance/edit/${maintenanceId}`);
      }, 1500);
    } catch (error) {
      console.error("Error creating maintenance assignment:", error);
      showError("Error al asignar mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isMaintenanceToVehicle && maintenanceId) {
      navigate(`/maintenance/edit/${maintenanceId}`);
    } else if (isVehicleToMaintenance && vehicleId) {
      navigate(`/vehicles/edit/${vehicleId}`);
    } else {
      navigate("/vehicles");
    }
  };

  const formSections: FormSection[] = [];

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
      fields: [
        {
          key: "patente",
          label: "Patente:",
          type: "text",
          value: vehicleSearch.selectedVehicle.licensePlate || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "marca",
          label: "Marca:",
          type: "text",
          value: vehicleSearch.selectedVehicle.brand || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "modelo",
          label: "Modelo:",
          type: "text",
          value: vehicleSearch.selectedVehicle.model || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "anio",
          label: "Año:",
          type: "text",
          value: vehicleSearch.selectedVehicle.year?.toString() || "",
          onChange: () => {},
          disabled: true,
        },
      ],
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
        fields: [
          {
            key: "patente",
            label: "Patente:",
            type: "text",
            value: vehicleSearch.selectedVehicle.licensePlate || "",
            onChange: () => {},
            disabled: true,
          },
          {
            key: "marca",
            label: "Marca:",
            type: "text",
            value: vehicleSearch.selectedVehicle.brand || "",
            onChange: () => {},
            disabled: true,
          },
          {
            key: "modelo",
            label: "Modelo:",
            type: "text",
            value: vehicleSearch.selectedVehicle.model || "",
            onChange: () => {},
            disabled: true,
          },
          {
            key: "anio",
            label: "Año:",
            type: "text",
            value: vehicleSearch.selectedVehicle.year?.toString() || "",
            onChange: () => {},
            disabled: true,
          },
        ],
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
        value: kilometersFrequency,
        onChange: (_key: string, value: string | number) =>
          setKilometersFrequency(Number(value) || 0),
        min: 0,
        placeholder: "0 = No aplicar por kilómetros",
      },
      {
        key: "daysFrequency",
        label: "Frecuencia en Días",
        type: "number",
        value: daysFrequency,
        onChange: (_key: string, value: string | number) =>
          setDaysFrequency(Number(value) || 0),
        min: 0,
        placeholder: "0 = No aplicar por días",
      },
    ],
  });

  const getPageTitle = () => {
    if (isMaintenanceToVehicle) {
      return "Asignar Mantenimiento a Vehículo";
    } else if (isVehicleToMaintenance) {
      return "Asignar Mantenimiento al Vehículo";
    }
    return "Asignar Mantenimiento";
  };

  const getLoadingText = () => {
    if (isMaintenanceToVehicle) {
      return "Cargando datos del mantenimiento...";
    } else if (isVehicleToMaintenance) {
      return "Cargando datos del vehículo...";
    }
    return "Cargando datos...";
  };

  return (
    <>
      {loadingData ? (
        <div className="maintenance-assignment-container">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>{getLoadingText()}</p>
          </div>
        </div>
      ) : (
        <div className="maintenance-assignment-container">
          <FormLayout title={getPageTitle()} sections={formSections}>
            <ButtonGroup>
              <CancelButton text="Cancelar" onClick={handleCancel} />
              <ConfirmButton
                text="Asignar Mantenimiento"
                onClick={handleSubmit}
                loading={loading}
              />
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
    </>
  );
}
