import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import {
  Form,
  type FormSection,
  type FormButton,
} from "../../../components/Form";
import { MaintenanceEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import { usePageState } from "../../../hooks";
import { getMe } from "../../../services/users";
import { getVehicleById } from "../../../services/vehicles";
import {
  getMaintenanceAssignmentById,
  getVehicleMaintenances,
} from "../../../services/maintenanceAssignments";
import { createMaintenanceRecord } from "../../../services/maintenanceRecords";
import type { User } from "../../../types/user";
import type { Vehicle } from "../../../types/vehicle";
import type { MaintenanceAssignment } from "../../../types/maintenanceAsignment";
import type { Maintenance } from "../../../types/maintenance";

export default function MaintenanceRecordRegisterPage() {
  const { vehicleId, maintenanceId, assignedMaintenanceId } = useParams<{
    vehicleId?: string;
    maintenanceId?: string;
    assignedMaintenanceId?: string;
  }>();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceAssignment | null>(
    null,
  );

  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  const needsMaintenanceSelection = !maintenanceId && !selectedMaintenance;

  const {
    loading,
    saving,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({ redirectOnSuccess: "/maintenance/records" });

  useEffect(() => {
    executeLoad(async () => {
      // Load current user
      const userResponse = await getMe();
      if (userResponse.success) setCurrentUser(userResponse.data);

      // Load vehicle if provided
      if (vehicleId) {
        const vehicleResp = await getVehicleById(vehicleId);
        if (vehicleResp.success) setVehicle(vehicleResp.data);
      }

      // Load maintenance assignment if provided
      if (maintenanceId) {
        const mResp = await getMaintenanceAssignmentById(maintenanceId);
        if (mResp.success) setMaintenance(mResp.data);
      }
    }, "Error al cargar los datos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, maintenanceId]);

  async function getAssignedForVehicleAndMaintenance(
    vehicleId: string,
    maintenanceId: string,
  ): Promise<string | undefined> {
    const resp = await getVehicleMaintenances(vehicleId);
    if (!resp.success) return undefined;
    const rows = Array.isArray(resp.data) ? resp.data : [resp.data];

    const found = (rows as unknown[]).find((r) => {
      const obj = r as Record<string, unknown>;
      const maintenanceObj = obj["maintenance"] as
        | Record<string, unknown>
        | undefined;
      const mid =
        (obj["maintenanceId"] as unknown) ??
        (obj["maintenance_id"] as unknown) ??
        (maintenanceObj && (maintenanceObj["id"] as unknown)) ??
        (maintenanceObj && (maintenanceObj["maintenanceId"] as unknown)) ??
        (maintenanceObj && (maintenanceObj["maintenance_id"] as unknown));
      return String(mid ?? "") === String(maintenanceId);
    });

    if (!found) return undefined;

    const obj = found as Record<string, unknown>;
    const assignedId =
      obj["assignmentId"] ??
      obj["assignment_id"] ??
      obj["assignedMaintenanceId"] ??
      obj["id"];
    return assignedId ? String(assignedId) : undefined;
  }

  // Form state
  const [notes, setNotes] = useState<string>("");
  const [kilometers, setKilometers] = useState<number | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = async () => {
    if (!currentUser || !vehicleId) {
      showError("Faltan datos requeridos");
      return;
    }

    const maintenanceToResolveId =
      selectedMaintenance?.id || maintenance?.maintenance?.id || undefined;

    if (!maintenanceToResolveId) {
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

    await executeSave(
      "¿Está seguro que desea crear este registro de mantenimiento?",
      async () => {
        let effectiveAssignedId: string | undefined = assignedMaintenanceId;
        if (!effectiveAssignedId) {
          const resolved = await getAssignedForVehicleAndMaintenance(
            vehicleId!,
            String(maintenanceToResolveId),
          );
          if (!resolved) {
            return {
              success: false,
              message: "Ese mantenimiento no está asignado a este vehículo.",
            };
          }
          effectiveAssignedId = resolved;
        }

        const payload = {
          assignedMaintenanceId: effectiveAssignedId,
          date: new Date(date).toISOString().split("T")[0],
          kilometers,
          notes: notes.trim() || undefined,
        };

        return await createMaintenanceRecord(payload);
      },
      "Registro de mantenimiento creado exitosamente",
    );
  };

  const handleCancel = () => goTo("/maintenance/assignments");

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
      value: vehicle.model?.brand?.name || "",
      onChange: () => {},
      disabled: true,
    },
    {
      key: "modelo",
      label: "Modelo:",
      type: "text" as const,
      value: vehicle.model?.name || "",
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

  const formSections: FormSection[] = [];

  if (vehicle) {
    formSections.push({
      type: "fields",
      title: "Datos del Vehículo",
      layout: "horizontal",
      fields: createVehicleFields(vehicle),
    });
  }

  // If there is no maintenance assignment id provided, allow selecting a Maintenance
  if (needsMaintenanceSelection) {
    formSections.push({
      type: "entity",
      render: (
        <MaintenanceEntitySearch
          maintenance={selectedMaintenance}
          onMaintenanceChange={(m) => setSelectedMaintenance(m)}
        />
      ),
    });
  } else {
    // show the maintenance assignment as display field
    formSections.push({
      type: "fields",
      title: "Mantenimiento",
      fields: [
        {
          type: "display",
          key: "maintenance",
          label: "Mantenimiento",
          value: maintenance?.maintenance?.name || "Cargando...",
        },
      ],
    });
  }

  // Registration section
  formSections.push({
    type: "fields",
    title: "Datos del Registro",
    fields: [
      {
        type: "display",
        key: "user",
        label: "Usuario que registra:",
        value: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "Cargando...",
      },
      {
        type: "date",
        key: "date",
        label: "Fecha:",
        value: date,
        onChange: (v: string) => setDate(v),
        required: true,
      },
      {
        type: "number",
        key: "kilometers",
        label: "Kilómetros:",
        value: kilometers || 0,
        onChange: (v: number) => setKilometers(Number(v) || null),
        required: true,
        placeholder: "Ingrese los kilómetros del vehículo",
      },
      {
        type: "textarea",
        key: "notes",
        label: "Notas:",
        value: notes,
        onChange: (v: string) => setNotes(v),
        placeholder: "Observaciones del mantenimiento realizado...",
      },
    ],
  });

  if (loading) return <LoadingSpinner message="Cargando datos..." />;

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: handleCancel,
      disabled: saving,
    },
    {
      text: saving ? "Guardando..." : "Guardar Registro",
      variant: "primary",
      onClick: handleSubmit,
      disabled: saving,
      loading: saving,
    },
  ];

  return (
    <div className="container">
      <Form
        title={"Registrar Mantenimiento"}
        sections={formSections}
        buttons={buttons}
      />

      <ConfirmDialog
        open={isDialogOpen}
        message={dialogMessage}
        onConfirm={handleDialogConfirm}
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
