import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FormLayout,
  NotificationToast,
  CancelButton,
  ConfirmButton,
  ButtonGroup,
  LoadingSpinner,
} from "../../components";
import type { FormSection } from "../../components";
import { getMe } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import { getMaintenancePossibleById } from "../../services/maintenances";
import { addMaintenanceRecord } from "../../services/maintenanceRecords";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { MaintenancePossibleNormalized } from "../../services/maintenances";
import "./MaintenanceRecordRegisterEdit.css";

export default function MaintenanceRecordRegisterEdit() {
  const navigate = useNavigate();
  const { vehicleId, maintenanceId } = useParams<{
    vehicleId?: string;
    maintenanceId?: string;
  }>();

  // Estado para datos pre-cargados
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] =
    useState<MaintenancePossibleNormalized | null>(null);

  // Estado para campos editables
  const [notes, setNotes] = useState<string>("");
  const [kilometers, setKilometers] = useState<number | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar usuario actual
        const userResponse = await getMe();
        if (userResponse.success) {
          setCurrentUser(userResponse.data);
        }

        // Cargar vehículo si se proporciona
        if (vehicleId) {
          const vehicleResponse = await getVehicleById(vehicleId);
          if (vehicleResponse.success) {
            setVehicle(vehicleResponse.data);
          }
        }

        // Cargar mantenimiento si se proporciona
        if (maintenanceId) {
          const maintenanceResponse = await getMaintenancePossibleById(
            maintenanceId
          );
          if (maintenanceResponse.success) {
            // Normalizar los datos del mantenimiento
            const normalizedMaintenance = {
              id: maintenanceResponse.data.id,
              name: maintenanceResponse.data.title || maintenanceId,
              maintenanceCategoryName:
                maintenanceResponse.data.categoryName || "",
            };
            setMaintenance(normalizedMaintenance);
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        showError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [vehicleId, maintenanceId]);

  const showSuccess = (message: string) => {
    setNotification({ isOpen: true, message, type: "success" });
  };

  const showError = (message: string) => {
    setNotification({ isOpen: true, message, type: "error" });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async () => {
    if (!currentUser || !vehicleId || !maintenanceId) {
      showError("Faltan datos requeridos");
      return;
    }

    if (!kilometers || kilometers <= 0) {
      showError("Debe ingresar los kilómetros");
      return;
    }

    if (!date) {
      showError("Debe seleccionar una fecha");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        vehicleId,
        maintenanceId,
        userId: currentUser.id,
        kilometers,
        date,
        notes: notes.trim() || undefined,
      };

      const response = await addMaintenanceRecord(payload);

      if (response.success) {
        showSuccess("Registro de mantenimiento creado exitosamente");
        setTimeout(() => {
          navigate(-1); // Volver a la página anterior
        }, 1500);
      } else {
        showError(response.message || "Error al crear el registro");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error al crear el registro de mantenimiento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Helper function para crear campos del vehículo (similar a MaintenanceAssignment)
  const createVehicleFields = (vehicle: Vehicle) => [
    {
      key: "patente",
      label: "Patente:",
      type: "text" as const,
      value: vehicle.licensePlate || "",
      onChange: () => {},
      disabled: true,
    },
    {
      key: "marca",
      label: "Marca:",
      type: "text" as const,
      value: vehicle.brand || "",
      onChange: () => {},
      disabled: true,
    },
    {
      key: "modelo",
      label: "Modelo:",
      type: "text" as const,
      value: vehicle.model || "",
      onChange: () => {},
      disabled: true,
    },
    {
      key: "anio",
      label: "Año:",
      type: "text" as const,
      value: vehicle.year?.toString() || "",
      onChange: () => {},
      disabled: true,
    },
  ];

  // Crear secciones del formulario
  const formSections: FormSection[] = [];

  // Sección del vehículo (horizontal)
  if (vehicle) {
    formSections.push({
      title: "Datos del Vehículo",
      horizontal: true,
      fields: createVehicleFields(vehicle),
    });
  }

  // Sección de datos del registro
  formSections.push({
    title: "Datos del Registro",
    fields: [
      // Campo de mantenimiento
      {
        key: "maintenance",
        label: "Mantenimiento:",
        type: "text" as const,
        value: maintenance?.name || "Cargando...",
        onChange: () => {},
        disabled: true,
      },
      {
        key: "user",
        label: "Usuario que registra:",
        type: "text" as const,
        value: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "Cargando...",
        onChange: () => {},
        disabled: true,
      },
      // Campos editables
      {
        key: "date",
        label: "Fecha:",
        type: "date" as const,
        value: date,
        onChange: (_key: string, value: string | number) =>
          setDate(value as string),
        required: true,
      },
      {
        key: "kilometers",
        label: "Kilómetros:",
        type: "number" as const,
        value: kilometers || "",
        onChange: (_key: string, value: string | number) =>
          setKilometers(Number(value) || null),
        required: true,
        placeholder: "Ingrese los kilómetros del vehículo",
      },
      {
        key: "notes",
        label: "Notas:",
        type: "textarea" as const,
        value: notes,
        onChange: (_key: string, value: string | number) =>
          setNotes(value as string),
        placeholder: "Observaciones del mantenimiento realizado...",
      },
    ],
  });

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <>
      <div className="maintenance-record-register-edit-container">
        <FormLayout title="Registrar Mantenimiento" sections={formSections}>
          <ButtonGroup>
            <CancelButton text="Cancelar" onClick={handleCancel} />
            <ConfirmButton
              text="Guardar Registro"
              onClick={handleSubmit}
              loading={submitting}
            />
          </ButtonGroup>
        </FormLayout>
      </div>

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </>
  );
}
