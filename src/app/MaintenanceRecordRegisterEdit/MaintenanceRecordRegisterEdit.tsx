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
import {
  getAssignedMaintenanceById,
  getVehicleMaintenances,
} from "../../services/assignedMaintenances";
import { createMaintenanceRecord } from "../../services/maintenanceRecords";
import { useMaintenanceSearch } from "../../hooks";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { AssignedMaintenance } from "../../types/assignedMaintenance";
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
  const [maintenance, setMaintenance] = useState<AssignedMaintenance | null>(
    null,
  );

  // Hook para buscar mantenimientos
  const maintenanceSearch = useMaintenanceSearch();

  const needsMaintenanceSelection = !maintenanceId;

  async function getAssignedForVehicleAndMaintenance(
    vehicleId: string,
    maintenanceId: string,
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
    new Date().toISOString().split("T")[0],
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

        if (vehicleId) {
          const vehicleResponse = await getVehicleById(vehicleId);
          if (vehicleResponse.success) {
            setVehicle(vehicleResponse.data);
          }
        }

        if (maintenanceId) {
          const maintenanceResponse = await getAssignedMaintenanceById(
            maintenanceId,
          );
          if (maintenanceResponse.success) {
            setMaintenance(maintenanceResponse.data);
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
      setSubmitting(true);
      let effectiveAssignedId: string | undefined = assignedMaintenanceId;
      if (!effectiveAssignedId) {
        const resolved = await getAssignedForVehicleAndMaintenance(
          vehicleId,
          String(selectedMaintenanceId),
        );
        if (!resolved) {
          showError("Ese mantenimiento no está asignado a este vehículo.");
          setSubmitting(false);
          return;
        }
        effectiveAssignedId = resolved;
      }

      const payload = {
        assignedMaintenanceId: effectiveAssignedId,
        date: new Date(date).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
        kilometers,
        notes: notes.trim() || undefined,
      };

      const response = await createMaintenanceRecord(payload);

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
    } finally {
      setSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };

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
      value:
        (vehicle as any).brandName ||
        vehicle.brand ||
        vehicle.modelObj?.brand?.name ||
        "",
      onChange: () => {},
      disabled: true,
    },
    {
      key: "modelo",
      label: "Modelo:",
      type: "text" as const,
      value:
        (vehicle as any).modelName ||
        vehicle.model ||
        vehicle.modelObj?.name ||
        "",
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
  const registrationSection: FormSection = {
    title: "Datos del Registro",
    fields: [
      // Campo de mantenimiento (dinámico según el contexto)
      needsMaintenanceSelection
        ? maintenanceSearch.selectedMaintenance
          ? {
              key: "selectedMaintenance",
              label: "Mantenimiento Seleccionado:",
              type: "text" as const,
              value: maintenanceSearch.selectedMaintenance.name,
              onChange: () => {},
              disabled: true,
            }
          : {
              key: "maintenanceSelect",
              label: "Seleccionar Mantenimiento:",
              type: "maintenanceSearch" as const,
              value: maintenanceSearch.searchTerm,
              onChange: () => {}, // No se usa directamente
              required: true,
              placeholder: "Busque y seleccione un mantenimiento",
              entitySearch: true,
              searchTerm: maintenanceSearch.searchTerm,
              onSearchChange: maintenanceSearch.searchMaintenances,
              availableMaintenances: maintenanceSearch.availableMaintenances,
              showDropdown: maintenanceSearch.showDropdown,
              onMaintenanceSelect: (maintenance: AssignedMaintenance) => {
                maintenanceSearch.selectMaintenance(maintenance);
              },
              onDropdownToggle: maintenanceSearch.setShowDropdown,
            }
        : {
            key: "maintenance",
            label: "Mantenimiento:",
            type: "text" as const,
            value: maintenance?.maintenance?.name || "Cargando...",
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
  };

  // Agregar botón de acción si hay mantenimiento seleccionado
  if (needsMaintenanceSelection && maintenanceSearch.selectedMaintenance) {
    registrationSection.actionButton = {
      text: "Cambiar mantenimiento",
      onClick: () => maintenanceSearch.clearSelection(),
    };
  }

  formSections.push(registrationSection);

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
