import { useParams, useLocation } from "react-router-dom";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../../hooks";
import { toInputDate, inputDateToISO } from "../../../common/date";
import {
  createAssignment,
  getAssignmentById,
  updateAssignment,
  finishAssignment,
} from "../../../services/assignments";
import { getVehicleById } from "../../../services/vehicles";
import { getUserById } from "../../../services/users";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Vehicle } from "../../../types/vehicle";
import type { User } from "../../../types/user";
import type { AssignmentInput } from "../../../types/assignment";

export default function VehicleAssignmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    isIndefinite: true,
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
  } = usePageState({ redirectOnSuccess: "/vehicles/assignments" });

  useEffect(() => {
    if (!isNew && assignmentId) {
      loadAssignment(assignmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, isNew]);

  // Load vehicle/user from query params when creating
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const vehicleId = searchParams.get("vehicleId");
    const userId = searchParams.get("userId");

    if (vehicleId) {
      executeLoad(async () => {
        const resp = await getVehicleById(vehicleId);
        if (resp.success && resp.data) setVehicle(resp.data);
      });
    }

    if (userId) {
      executeLoad(async () => {
        const resp = await getUserById(userId);
        if (resp.success && resp.data) setUser(resp.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  const loadAssignment = async (id: string) => {
    await executeLoad(async () => {
      const response = await getAssignmentById(id);
      if (response.success && response.data) {
        const a = response.data;
        setUser(a.user || null);
        setVehicle(a.vehicle || null);
        setFormData({
          startDate: a.startDate ? new Date(a.startDate) : new Date(),
          endDate: a.endDate ? new Date(a.endDate) : new Date(),
          isIndefinite: !a.endDate,
        });
      } else {
        showError(response.message || "Error al cargar la asignación");
      }
    }, "Error al cargar la asignación");
  };

  const validate = () => {
    if (!user) {
      showError("El usuario es obligatorio");
      return false;
    }
    if (!vehicle) {
      showError("El vehículo es obligatorio");
      return false;
    }
    if (!formData.startDate) {
      showError("La fecha de inicio es obligatoria");
      return false;
    }
    return true;
  };

  // Backend will handle existence/duplicate validations; keep UI checks minimal.

  const handleSave = async () => {
    if (!validate()) return;

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} esta asignación?`,
      async () => {
        if (isNew) {
          const payload: AssignmentInput = {
            userId: user!.id,
            vehicleId: vehicle!.id,
            startDate: inputDateToISO(toInputDate(formData.startDate)),
            endDate: formData.isIndefinite
              ? null
              : inputDateToISO(toInputDate(formData.endDate)),
            active: true,
          };

          return await createAssignment(payload);
        } else {
          const updateData: Partial<AssignmentInput> = {
            startDate: inputDateToISO(toInputDate(formData.startDate)),
            endDate: formData.isIndefinite
              ? null
              : inputDateToISO(toInputDate(formData.endDate)),
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
      title: "Período de Asignación",
      fields: [
        {
          type: "date",
          value: toInputDate(formData.startDate),
          onChange: (value: string) =>
            setFormData({ ...formData, startDate: new Date(value) }),
          key: "startDate",
          label: "Fecha Inicio",
          required: true,
        },
        {
          type: "checkbox",
          key: "isIndefinite",
          label: "Asignación indefinida",
          value: formData.isIndefinite,
          onChange: (v: boolean) =>
            setFormData({ ...formData, isIndefinite: v }),
        },
        {
          type: "date",
          value: toInputDate(formData.endDate),
          onChange: (value: string) =>
            setFormData({ ...formData, endDate: new Date(value) }),
          key: "endDate",
          label: "Fecha Fin",
          show: !formData.isIndefinite,
          min: toInputDate(formData.startDate),
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary" as const,
      onClick: () => goTo("/vehicles/assignments"),
      disabled: saving,
    },
    ...(!isNew
      ? [
          {
            text: "Finalizar asignación",
            variant: "danger" as const,
            onClick: handleUnassign,
            disabled: saving,
          },
        ]
      : []),
    {
      text: saving
        ? "Guardando..."
        : isNew
        ? "Crear Asignación"
        : "Actualizar Asignación",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) return <LoadingSpinner message="Cargando asignación..." />;

  return (
    <div className="container">
      <Form
        title={isNew ? "Nueva Asignación" : "Editar Asignación"}
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
