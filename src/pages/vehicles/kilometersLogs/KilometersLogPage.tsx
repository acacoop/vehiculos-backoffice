import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { Form, type FormSection } from "../../../components/Form";
import {
  UserEntitySearch,
  VehicleEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import { usePageState } from "../../../hooks";
import {
  createVehicleKilometersLog,
  getVehicleKilometersLogById,
  updateVehicleKilometersLog,
  deleteVehicleKilometersLog,
} from "../../../services/kilometers";
import type { VehicleKilometersLog } from "../../../types/kilometer";
import {
  toInputDateTimeSafe,
  inputDateTimeToAPI,
  parseDate,
} from "../../../common/date";

export default function KilometersLogPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<VehicleKilometersLog>>({});

  // Handler for initial data
  const handleInitialData = useCallback(
    (data: Partial<VehicleKilometersLog>) => {
      setFormState(data);
    },
    [],
  );

  const {
    loading,
    saving,
    isEditing,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    enableEdit,
    cancelEdit,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
    cancelCreate,
  } = usePageState<Partial<VehicleKilometersLog>>({
    redirectOnSuccess: "/vehicles/kilometersLogs",
    startInViewMode: !isNew,
    scope: "kilometersLog",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing log (new entities handled via onInitialData)
    if (!isNew && id) {
      loadKilometersLog(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadKilometersLog = async (logId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleKilometersLogById(logId);

      if (response.success && response.data) {
        setFormState(response.data);
        setOriginalData(response.data);
      } else {
        showError(response.message || "Error al cargar el registro");
      }
    }, "Error al cargar el registro");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles/kilometersLogs");
    } else {
      const original = cancelEdit<Partial<VehicleKilometersLog>>();
      if (original) {
        setFormState(original);
      }
    }
  };

  const validateForm = () => {
    if (!formState.user) {
      showError("Debe seleccionar un usuario");
      return false;
    }
    if (!formState.vehicle) {
      showError("Debe seleccionar un vehículo");
      return false;
    }
    if (!formState.date) {
      showError("Debe seleccionar una fecha");
      return false;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow today's date
    const formDate = parseDate(formState.date);
    if (formDate && formDate > today) {
      showError("La fecha de registro no puede ser futura");
      return false;
    }

    if (!formState.kilometers || formState.kilometers <= 0) {
      showError("El kilometraje debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const payload = {
      vehicleId: formState.vehicle!.id,
      userId: formState.user!.id,
      date: inputDateTimeToAPI(formState.date!),
      kilometers: formState.kilometers!,
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

  const getFormData = () => formState;

  const sections: FormSection[] = [
    {
      type: "entity",
      render: ({ disabled }) => (
        <UserEntitySearch
          entity={formState.user || null}
          onEntityChange={(user) =>
            setFormState((prev) => ({ ...prev, user: user || undefined }))
          }
          disabled={disabled || !isNew}
        />
      ),
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleEntitySearch
          entity={formState.vehicle || null}
          onEntityChange={(vehicle) =>
            setFormState((prev) => ({ ...prev, vehicle: vehicle || undefined }))
          }
          disabled={disabled || !isNew}
          contextScope="kilometersLog"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "fields",
      title: "Detalles del registro",
      layout: "vertical",
      fields: [
        {
          type: "datetime",
          value: toInputDateTimeSafe(formState.date),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, date: value })),
          key: "date",
          label: "Fecha y hora de Registro",
          required: true,
        },
        {
          type: "number",
          value: formState.kilometers || 0,
          onChange: (value: number) =>
            setFormState((prev) => ({ ...prev, kilometers: value })),
          key: "kilometers",
          label: "Kilometraje",
          required: true,
          min: 0,
        },
      ],
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
            ? "Nuevo registro de kilometraje"
            : "Editar registro de kilometraje"
        }
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleDelete : undefined,
          saving,
          entityName: "Registro",
        }}
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
