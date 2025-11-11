import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import {
  Form,
  type FormSection,
  type FormButton,
} from "../../../components/Form";
import {
  AssignedMaintenanceEntitySearch,
  UserEntitySearch,
  VehicleEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import { usePageState } from "../../../hooks";
import { getUserById } from "../../../services/users";
import { getVehicleById } from "../../../services/vehicles";
import { getAssignedMaintenanceById } from "../../../services/assignedMaintenances";
import {
  createMaintenanceRecord,
  getMaintenanceRecordById,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from "../../../services/maintenanceRecords";
import type { User } from "../../../types/user";
import type { Vehicle } from "../../../types/vehicle";
import type { AssignedMaintenance } from "../../../types/assignedMaintenance";

export default function MaintenanceRecordRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [assignedMaintenance, setAssignedMaintenance] =
    useState<AssignedMaintenance | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    kilometers: 0,
    observations: "",
  });

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
    if (isNew || !id) return;

    loadRecord(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const vehicleId = searchParams.get("vehicleId");

    if (vehicleId) {
      executeLoad(async () => {
        const response = await getVehicleById(vehicleId);
        if (response.success && response.data) {
          setVehicle(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Load assignedMaintenance from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const assignedMaintenanceId = searchParams.get("assignedMaintenanceId");

    if (assignedMaintenanceId) {
      executeLoad(async () => {
        const response = await getAssignedMaintenanceById(
          assignedMaintenanceId,
        );
        if (response.success && response.data) {
          setAssignedMaintenance(response.data);
          setVehicle(response.data.vehicle);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Load user from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");

    if (userId) {
      executeLoad(async () => {
        const response = await getUserById(userId);
        if (response.success && response.data) {
          setUser(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Clear assignedMaintenance when vehicle changes
  useEffect(() => {
    if (vehicle) return;

    setAssignedMaintenance(null);
  }, [vehicle]);

  const loadRecord = async (recordId: string) => {
    await executeLoad(async () => {
      const response = await getMaintenanceRecordById(recordId);

      if (response.success && response.data) {
        const record = response.data;

        const recordDate = new Date(record.date);

        setFormData({
          date: recordDate.toISOString().split("T")[0],
          kilometers: record.kilometers,
          observations: record.notes || "",
        });

        if (record.user) {
          setUser(record.user);
        }

        if (record.assignedMaintenance) {
          setVehicle(record.assignedMaintenance.vehicle);
          setAssignedMaintenance(record.assignedMaintenance);
        }
      } else {
        showError(response.message || "Error al cargar el registro");
      }
    }, "Error al cargar el registro");
  };

  const validateForm = () => {
    if (!user) {
      showError("Debe seleccionar un usuario");
      return false;
    }
    if (!vehicle) {
      showError("Debe seleccionar un vehículo");
      return false;
    }
    if (!assignedMaintenance) {
      showError("Debe seleccionar un mantenimiento");
      return false;
    }
    if (!formData.date) {
      showError("Debe seleccionar una fecha");
      return false;
    }
    if (formData.kilometers <= 0) {
      showError("Los kilómetros deben ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const payload = {
      assignedMaintenanceId: assignedMaintenance!.id,
      userId: user!.id,
      date: new Date(formData.date).toISOString(),
      kilometers: formData.kilometers,
      notes: formData.observations,
    };

    executeSave(
      `¿Está seguro que desea ${actionText} este registro?`,
      () =>
        isNew
          ? createMaintenanceRecord(payload)
          : updateMaintenanceRecord(id!, payload),
      `Registro ${actionText}do con éxito`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar este registro?",
      () => deleteMaintenanceRecord(id),
      "Registro eliminado con éxito",
    );
  };

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <UserEntitySearch
          entity={user}
          onEntityChange={setUser}
          disabled={!isNew}
        />
      ),
    },
    {
      type: "entity",
      render: (
        <VehicleEntitySearch
          entity={vehicle}
          onEntityChange={setVehicle}
          disabled={!isNew}
        />
      ),
    },
    {
      type: "entity",
      render: (
        <AssignedMaintenanceEntitySearch
          entity={assignedMaintenance}
          onEntityChange={setAssignedMaintenance}
          vehicleId={vehicle ? vehicle.id : ""}
          disabled={!vehicle || !isNew}
        />
      ),
    },
    {
      type: "fields",
      title: "Detalles del Registro",
      layout: "vertical",
      fields: [
        {
          type: "date",
          value: formData.date,
          onChange: (value: string) =>
            setFormData({ ...formData, date: value }),
          key: "date",
          label: "Fecha",
          required: true,
        },
        {
          type: "number",
          value: formData.kilometers,
          onChange: (value: number) =>
            setFormData({ ...formData, kilometers: value }),
          key: "kilometers",
          label: "Kilómetros",
          required: true,
          min: 0,
        },
        {
          type: "textarea",
          value: formData.observations,
          onChange: (value: string) =>
            setFormData({ ...formData, observations: value }),
          key: "observations",
          label: "Observaciones",
          rows: 3,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/records"),
      disabled: saving,
    },
    ...(!isNew
      ? [
          {
            text: "Eliminar",
            variant: "danger" as const,
            onClick: handleDelete,
            disabled: saving,
          },
        ]
      : []),
    {
      text: saving
        ? "Guardando..."
        : isNew
        ? "Crear Registro"
        : "Actualizar Registro",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando registro..." />;
  }

  return (
    <div>
      <Form
        title={
          isNew
            ? "Nuevo Registro de Mantenimiento"
            : "Editar Registro de Mantenimiento"
        }
        sections={sections}
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
