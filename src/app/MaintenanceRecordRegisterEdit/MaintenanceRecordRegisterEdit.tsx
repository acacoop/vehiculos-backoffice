import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FormLayout,
  NotificationToast,
  LoadingSpinner,
} from "../../components";
import type { FormField } from "../../components";
import {
  FieldType,
  EntityType,
  InputType,
} from "../../components/FormLayout/FormLayout";
import { getMe } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import { getMaintenancePossibleById } from "../../services/maintenances";
import { addMaintenanceRecord } from "../../services/maintenanceRecords";
import { useMaintenanceSearch } from "../../hooks";
import { getVehicleMaintenances } from "../../services/maintenances";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { MaintenancePossibleNormalized } from "../../services/maintenances";
import "./MaintenanceRecordRegisterEdit.css";

export default function MaintenanceRecordRegisterEdit() {
  const navigate = useNavigate();
  const { vehicleId, maintenanceId, assignedMaintenanceId } = useParams<{
    vehicleId?: string;
    maintenanceId?: string;
    assignedMaintenanceId?: string;
  }>();

  // Estado para datos pre-cargados
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] =
    useState<MaintenancePossibleNormalized | null>(null);

  // Hook para buscar mantenimientos
  const maintenanceSearch = useMaintenanceSearch();

  const needsMaintenanceSelection = !maintenanceId;

  async function getAssignedForVehicleAndMaintenance(
    vehicleId: string,
    maintenanceId: string
  ): Promise<string | undefined> {
    const resp = await getVehicleMaintenances(vehicleId);
    if (!resp.success) return undefined;

    const rows = Array.isArray(resp.data) ? resp.data : [resp.data];

    const found = rows.find((r: any) => {
      const mid =
        r.maintenanceId ??
        r.maintenance_id ??
        r?.maintenance?.id ??
        r?.maintenance?.maintenanceId ??
        r?.maintenance?.maintenance_id;
      return String(mid) === String(maintenanceId);
    });

    if (!found) return undefined;

    const assignedId =
      found.assignmentId ??
      found.assignment_id ??
      found.assignedMaintenanceId ??
      found.id;

    return assignedId ? String(assignedId) : undefined;
  }

  // Estado para campos editables
  const [notes, setNotes] = useState<string>("");
  const [kilometers, setKilometers] = useState<number | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Estado de UI
  const [loading, setLoading] = useState(true);
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

        if (vehicleId) {
          const vehicleResponse = await getVehicleById(vehicleId);
          if (vehicleResponse.success) {
            setVehicle(vehicleResponse.data);
          }
        }

        if (maintenanceId) {
          const maintenanceResponse = await getMaintenancePossibleById(
            maintenanceId
          );
          if (maintenanceResponse.success) {
            const normalizedMaintenance = {
              id: maintenanceResponse.data.id,
              name: maintenanceResponse.data.title || maintenanceId,
              categoryName: maintenanceResponse.data.categoryName || "",
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
    if (!currentUser || !vehicleId) {
      showError("Faltan datos requeridos");
      return;
    }

    const selectedMaintenanceId =
      maintenanceId || maintenanceSearch.selectedMaintenance?.id;

    if (!selectedMaintenanceId) {
      showError("Debe seleccionar un mantenimiento");
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
      let effectiveAssignedId: string | undefined = assignedMaintenanceId;
      if (!effectiveAssignedId) {
        const resolved = await getAssignedForVehicleAndMaintenance(
          vehicleId,
          String(selectedMaintenanceId)
        );
        if (!resolved) {
          showError("Ese mantenimiento no está asignado a este vehículo.");
          return;
        }
        effectiveAssignedId = resolved;
      }

      const payload = {
        vehicleId,
        assignedMaintenanceId: effectiveAssignedId,
        userId: currentUser.id,
        kilometers,
        date: new Date(date),
        notes: notes.trim() || undefined,
      };

      const response = await addMaintenanceRecord(payload);

      if (response.success) {
        showSuccess("Registro de mantenimiento creado exitosamente");
        setTimeout(() => {
          navigate(-1);
        }, 600);
      } else {
        showError(response.message || "Error al crear el registro");
      }
    } catch (error) {
      console.error(error);
      showError("Error al crear el registro de mantenimiento");
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };

  const handleFieldChange = (key: string, value: any) => {
    switch (key) {
      case "date":
        setDate(value);
        break;
      case "kilometers":
        setKilometers(Number(value) || null);
        break;
      case "notes":
        setNotes(value);
        break;
      default:
        break;
    }
  };

  const createVehicleFields = (vehicle: Vehicle): FormField[] => [
    {
      type: FieldType.TEXT_FIXED,
      title: "Patente:",
      value: vehicle.licensePlate || "",
      key: "patente",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Marca:",
      value:
        (vehicle as any).brandName ||
        vehicle.brand ||
        vehicle.modelObj?.brand?.name ||
        "",
      key: "marca",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Modelo:",
      value:
        (vehicle as any).modelName ||
        vehicle.model ||
        vehicle.modelObj?.name ||
        "",
      key: "modelo",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Año:",
      value: vehicle.year?.toString() || "",
      key: "anio",
    },
  ];

  const createFormFields = (): FormField[] => {
    const fields: FormField[] = [];

    // Campos del vehículo si existe
    if (vehicle) {
      fields.push(...createVehicleFields(vehicle));
    }

    // Campo de mantenimiento (dinámico según el contexto)
    if (needsMaintenanceSelection) {
      if (maintenanceSearch.selectedMaintenance) {
        fields.push({
          type: FieldType.TEXT_FIXED,
          title: "Mantenimiento Seleccionado:",
          value: maintenanceSearch.selectedMaintenance.name,
          key: "selectedMaintenance",
        });
      } else {
        fields.push({
          type: FieldType.SEARCH,
          title: "Seleccionar Mantenimiento:",
          value: maintenanceSearch.selectedMaintenance,
          key: "maintenanceSelect",
          entityType: EntityType.MAINTENANCE,
          searchTerm: maintenanceSearch.searchTerm,
          onSearchChange: maintenanceSearch.searchMaintenances,
          availableEntities: maintenanceSearch.availableMaintenances,
          showDropdown: maintenanceSearch.showDropdown,
          onSelect: (maintenance: MaintenancePossibleNormalized) => {
            maintenanceSearch.selectMaintenance(maintenance);
          },
          onDropdownToggle: maintenanceSearch.setShowDropdown,
          placeholder: "Busque y seleccione un mantenimiento",
          required: true,
        });
      }
    } else {
      fields.push({
        type: FieldType.TEXT_FIXED,
        title: "Mantenimiento:",
        value: maintenance?.name || "Cargando...",
        key: "maintenance",
      });
    }

    // Usuario que registra
    fields.push({
      type: FieldType.TEXT_FIXED,
      title: "Usuario que registra:",
      value: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "Cargando...",
      key: "user",
    });

    // Campos editables
    fields.push(
      {
        type: FieldType.DATE,
        title: "Fecha:",
        value: date,
        key: "date",
        required: true,
        validation: (value: string) => ({
          isValid: !!value,
          message: "La fecha es requerida",
        }),
      },
      {
        type: FieldType.INPUT,
        title: "Kilómetros:",
        value: kilometers || "",
        key: "kilometers",
        inputType: InputType.NUMBER,
        required: true,
        placeholder: "Ingrese los kilómetros del vehículo",
        min: 0,
        validation: (value: number) => ({
          isValid: value > 0,
          message: "Los kilómetros deben ser mayor a 0",
        }),
      },
      {
        type: FieldType.TEXTAREA,
        title: "Notas:",
        value: notes,
        key: "notes",
        placeholder: "Observaciones del mantenimiento realizado...",
        rows: 3,
      }
    );

    return fields;
  };

  const buttonConfig = {
    primary: {
      text: "Guardar Registro",
      onClick: handleSubmit,
    },
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
    secondary:
      needsMaintenanceSelection && maintenanceSearch.selectedMaintenance
        ? {
            text: "Cambiar mantenimiento",
            onClick: () => maintenanceSearch.clearSelection(),
          }
        : undefined,
  };

  const formFields = createFormFields();

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <>
      <div className="maintenance-record-register-edit-container">
        <FormLayout
          title="Registrar Mantenimiento"
          formFields={formFields}
          buttonConfig={buttonConfig}
          onFieldChange={handleFieldChange}
        />
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
