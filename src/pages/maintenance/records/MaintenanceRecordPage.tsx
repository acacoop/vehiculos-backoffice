import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { Form, type FormSection } from "../../../components/Form";
import {
  MaintenanceEntitySearch,
  UserEntitySearch,
  VehicleEntitySearch,
  VehicleKilometersLogEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import { usePageState } from "../../../hooks";
import {
  createMaintenanceRecord,
  getMaintenanceRecordById,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from "../../../services/maintenanceRecords";

import type { MaintenanceRecord } from "../../../types/maintenanceRecord";
import { inputDateToAPI, toInputDateSafe } from "../../../common/date";

// Extended form state with local kilometers field for editing
interface FormState extends Partial<MaintenanceRecord> {
  kilometers?: number;
}

export default function MaintenanceRecordRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data with local kilometers field)
  const [formState, setFormState] = useState<FormState>({
    date: toInputDateSafe(undefined),
  });

  // Handler for initial data - extract kilometers from kilometersLog
  const handleInitialData = useCallback((data: Partial<MaintenanceRecord>) => {
    setFormState({
      ...data,
      kilometers: data.kilometersLog?.kilometers,
    });
  }, []);

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
  } = usePageState<Partial<MaintenanceRecord>>({
    redirectOnSuccess: "/maintenance/records",
    startInViewMode: !isNew,
    scope: "maintenanceRecord",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing record (new entities handled via onInitialData)
    if (!isNew && id) {
      loadRecord(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadRecord = async (recordId: string) => {
    await executeLoad(async () => {
      const response = await getMaintenanceRecordById(recordId);

      if (response.success && response.data) {
        const formData: FormState = {
          ...response.data,
          kilometers: response.data.kilometersLog?.kilometers,
        };
        setFormState(formData);
        setOriginalData(formData);
      } else {
        showError(response.message || "Error al cargar el registro");
      }
    }, "Error al cargar el registro");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/maintenance/records");
    } else {
      const original = cancelEdit<FormState>();
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
    if (!formState.maintenance) {
      showError("Debe seleccionar un mantenimiento");
      return false;
    }
    if (!formState.date) {
      showError("Debe seleccionar una fecha");
      return false;
    }
    if (!formState.kilometers || formState.kilometers <= 0) {
      showError("Los kilómetros deben ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const payload = {
      maintenanceId: formState.maintenance!.id,
      vehicleId: formState.vehicle!.id,
      userId: formState.user!.id,
      date: inputDateToAPI(toInputDateSafe(formState.date)),
      kilometers: formState.kilometers!,
      notes: formState.notes || "",
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

  const getFormData = () => formState;

  // Determine if we're in view mode (not new and not editing)
  const isViewMode = !isNew && !isEditing;

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
          contextScope="maintenanceRecord"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <MaintenanceEntitySearch
          entity={formState.maintenance || null}
          onEntityChange={(maintenance) =>
            setFormState((prev) => ({
              ...prev,
              maintenance: maintenance || undefined,
            }))
          }
          disabled={disabled || !formState.vehicle || !isNew}
          contextScope="maintenanceRecord"
          getFormData={getFormData}
        />
      ),
    },
    ...(isViewMode && formState.kilometersLog
      ? [
          {
            type: "entity" as const,
            render: () => (
              <VehicleKilometersLogEntitySearch
                entity={formState.kilometersLog || null}
                onEntityChange={() => {}}
                disabled={true}
              />
            ),
          },
        ]
      : []),
    {
      type: "fields",
      title: "Detalles del registro",
      layout: "vertical",
      fields: [
        {
          type: "date",
          value: toInputDateSafe(formState.date),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, date: value })),
          key: "date",
          label: "Fecha",
          required: true,
        },
        // Show number input only in edit/create mode
        ...(!isViewMode
          ? [
              {
                type: "number" as const,
                value: formState.kilometers || 0,
                onChange: (value: number) =>
                  setFormState((prev) => ({ ...prev, kilometers: value })),
                key: "kilometers",
                label: "Kilómetros",
                required: true,
                min: 0,
              },
            ]
          : []),
        {
          type: "textarea",
          value: formState.notes || "",
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, notes: value })),
          key: "notes",
          label: "Observaciones",
          rows: 3,
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
            ? "Nuevo registro de mantenimiento"
            : "Editar registro de mantenimiento"
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
