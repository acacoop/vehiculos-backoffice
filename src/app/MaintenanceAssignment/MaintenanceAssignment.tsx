import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMaintenancePossibles,
  type MaintenancePossibleNormalized,
} from "../../services/maintenances";
import {
  FormLayout,
  NotificationToast,
  CancelButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components";
import type { FormSection } from "../../components";
import { useVehicleSearch } from "../../hooks";
import { API_CONFIG } from "../../common";
import "./MaintenanceAssignment.css";

export default function MaintenanceAssignment() {
  const navigate = useNavigate();
  const { maintenanceId } = useParams<{ maintenanceId: string }>();

  const [maintenanceData, setMaintenanceData] =
    useState<MaintenancePossibleNormalized | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [kilometersFrequency, setKilometersFrequency] = useState<number>(0);
  const [daysFrequency, setDaysFrequency] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Use vehicle search hook
  const vehicleSearch = useVehicleSearch();

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
    const loadMaintenanceData = async () => {
      if (!maintenanceId) {
        showError("ID de mantenimiento no válido");
        setLoadingData(false);
        return;
      }

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

    loadMaintenanceData();
  }, [maintenanceId]);

  const handleSubmit = async () => {
    if (!vehicleSearch.selectedVehicle) {
      showError("Debe seleccionar un vehículo");
      return;
    }

    if (!maintenanceId) {
      showError("ID de mantenimiento no válido");
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
        maintenanceId,
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
    navigate(`/maintenance/edit/${maintenanceId}`);
  };

  const formSections: FormSection[] = [
    {
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
    },
  ];

  // Sección de vehículo - dinámicamente según si hay selección
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

  return (
    <>
      {loadingData ? (
        <div className="maintenance-assignment-container">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>Cargando datos del mantenimiento...</p>
          </div>
        </div>
      ) : (
        <div className="maintenance-assignment-container">
          <FormLayout
            title="Asignar Mantenimiento a Vehículo"
            sections={formSections}
          >
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
