import { useParams, useLocation } from "react-router-dom";
import { Form, type FormSection } from "../../../components/Form";
import { useEffect, useState, useCallback } from "react";
import { usePageState } from "../../../hooks";
import { toInputDate, inputDateToAPI } from "../../../common/date";
import {
  createAssignment,
  getAssignmentById,
  updateAssignment,
  finishAssignment,
} from "../../../services/assignments";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Assignment, AssignmentInput } from "../../../types/assignment";

export default function VehicleAssignmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<Assignment>>({});

  // UI-only checkbox state
  const [isIndefinite, setIsIndefinite] = useState(true);

  // Handler for initial data - extracts Assignment from the merged data
  const handleInitialData = useCallback((data: Partial<Assignment>) => {
    setFormState(data);
    setIsIndefinite(!data.endDate);
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
  } = usePageState<Partial<Assignment>>({
    redirectOnSuccess: "/vehicles/assignments",
    startInViewMode: !isNew,
    scope: "assignment",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing assignment (new entities handled via onInitialData)
    if (!isNew && assignmentId) {
      loadAssignment(assignmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, isNew]);

  const loadAssignment = async (id: string) => {
    await executeLoad(async () => {
      const response = await getAssignmentById(id);
      if (response.success && response.data) {
        const a = response.data;
        setFormState(a);
        setIsIndefinite(!a.endDate);
        setOriginalData({
          formState: a,
          isIndefinite: !a.endDate,
        });
      } else {
        showError(response.message || "Error al cargar la asignación");
      }
    }, "Error al cargar la asignación");
  };

  const validate = () => {
    if (!formState.user) {
      showError("El usuario es obligatorio");
      return false;
    }
    if (!formState.vehicle) {
      showError("El vehículo es obligatorio");
      return false;
    }
    if (!formState.startDate) {
      showError("La fecha de inicio es obligatoria");
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles/assignments");
    } else {
      const original = cancelEdit<{
        formState: Partial<Assignment>;
        isIndefinite: boolean;
      }>();
      if (original) {
        setFormState(original.formState);
        setIsIndefinite(original.isIndefinite);
      }
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const startDate = formState.startDate
      ? inputDateToAPI(toInputDate(new Date(formState.startDate)))
      : inputDateToAPI(toInputDate(new Date()));

    const endDate =
      isIndefinite || !formState.endDate
        ? null
        : inputDateToAPI(toInputDate(new Date(formState.endDate)));

    executeSave(
      `¿Está seguro que desea ${actionText} esta asignación?`,
      async () => {
        if (isNew) {
          const payload: AssignmentInput = {
            userId: formState.user!.id,
            vehicleId: formState.vehicle!.id,
            startDate,
            endDate,
            active: true,
          };

          return await createAssignment(payload);
        } else {
          const updateData: Partial<AssignmentInput> = {
            startDate,
            endDate,
          };

          return await updateAssignment(assignmentId!, updateData);
        }
      },
      `Asignación ${actionText}da exitosamente`,
    );
  };

  const handleUnassign = () => {
    if (!assignmentId) return;

    executeSave(
      "¿Está seguro que desea finalizar esta asignación (desasignar)?",
      () =>
        finishAssignment(assignmentId!, { endDate: new Date().toISOString() }),
      "Asignación finalizada con éxito",
    );
  };

  if (loading) return <LoadingSpinner message="Cargando asignación..." />;

  const getFormData = () => ({ formState, isIndefinite });

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
          contextScope="assignment"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "fields",
      title: "Período de Asignación",
      layout: "grid",
      fields: [
        {
          type: "date",
          value: formState.startDate
            ? toInputDate(new Date(formState.startDate))
            : toInputDate(new Date()),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, startDate: value })),
          key: "startDate",
          label: "Fecha Inicio",
          required: true,
        },
        {
          type: "date",
          value: formState.endDate
            ? toInputDate(new Date(formState.endDate))
            : toInputDate(new Date()),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, endDate: value })),
          key: "endDate",
          label: "Fecha Fin",
          show: !isIndefinite,
          min: formState.startDate
            ? toInputDate(new Date(formState.startDate))
            : undefined,
        },
        {
          type: "checkbox",
          key: "isIndefinite",
          label: "Asignación indefinida (sin fecha de fin)",
          value: isIndefinite,
          onChange: (v: boolean) => setIsIndefinite(v),
          span: 2,
        },
      ],
    },
  ];

  return (
    <div className="container">
      <Form
        title={isNew ? "Nueva Asignación" : "Editar Asignación"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleUnassign : undefined,
          saving,
          entityName: "Asignación",
          texts: {
            delete: "Finalizar asignación",
          },
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
