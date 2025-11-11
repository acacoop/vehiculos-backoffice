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
  UserEntitySearch,
  VehicleEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import { usePageState } from "../../../hooks";
import { getUserById } from "../../../services/users";
import { getVehicleById } from "../../../services/vehicles";
import {
  createVehicleKilometersLog,
  getVehicleKilometersLogById,
  updateVehicleKilometersLog,
  deleteVehicleKilometersLog,
} from "../../../services/kilometers";
import type { User } from "../../../types/user";
import type { Vehicle } from "../../../types/vehicle";

export default function KilometersLogPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    kilometers: 0,
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
  } = usePageState({ redirectOnSuccess: "/vehicles/kilometersLogs" });

  // Load existing kilometers log
  useEffect(() => {
    if (isNew || !id) return;

    loadKilometersLog(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load vehicle from query parameter
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

  const loadKilometersLog = async (logId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleKilometersLogById(logId);

      if (response.success && response.data) {
        const log = response.data;

        const logDate = new Date(log.date);

        setFormData({
          date: logDate.toISOString().split("T")[0],
          kilometers: log.kilometers,
        });

        if (log.user) {
          setUser(log.user);
        }

        if (log.vehicle) {
          setVehicle(log.vehicle);
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
    if (!formData.date) {
      showError("Debe seleccionar una fecha");
      return false;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    if (selectedDate > today) {
      showError("La fecha de registro no puede ser futura");
      return false;
    }

    if (formData.kilometers <= 0) {
      showError("El kilometraje debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const payload = {
      vehicleId: vehicle!.id,
      userId: user!.id,
      date: formData.date,
      kilometers: formData.kilometers,
    };

    executeSave(
      `¿Está seguro que desea ${actionText} este registro de kilometraje?`,
      () =>
        isNew
          ? createVehicleKilometersLog(payload)
          : updateVehicleKilometersLog(id!, payload),
      `Registro de kilometraje ${actionText}do con éxito`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar este registro de kilometraje?",
      () => deleteVehicleKilometersLog(id),
      "Registro de kilometraje eliminado con éxito",
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
          label: "Fecha de Registro",
          required: true,
        },
        {
          type: "number",
          value: formData.kilometers,
          onChange: (value: number) =>
            setFormData({ ...formData, kilometers: value }),
          key: "kilometers",
          label: "Kilometraje",
          required: true,
          min: 0,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/vehicles/kilometersLogs"),
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
            ? "Nuevo Registro de Kilometraje"
            : "Editar Registro de Kilometraje"
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
