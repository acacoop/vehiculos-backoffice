import { useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { Form, type FormSection } from "../../components/Form";
import { useEffect, useState, useCallback } from "react";
import { usePageState } from "../../hooks";
import {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
} from "../../services/reservations";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import type { Reservation } from "../../types/reservation";
import {
  toInputDateTimeSafe,
  inputDateTimeToAPI,
  parseDate,
} from "../../common/date";
import { ROUTES } from "../../common";

export default function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<Reservation>>({});

  // Handler for initial data
  const handleInitialData = useCallback((data: Partial<Reservation>) => {
    setFormState(data);
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
  } = usePageState<Partial<Reservation>>({
    redirectOnSuccess: "/reservations",
    startInViewMode: !isNew,
    scope: "reservation",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing reservation (new entities handled via onInitialData)
    if (!isNew && id) {
      loadReservation(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadReservation = async (reservationId: string) => {
    await executeLoad(async () => {
      const response = await getReservationById(reservationId);

      if (response.success && response.data) {
        setFormState(response.data);
        setOriginalData(response.data);
      } else {
        showError(response.message || "Error al cargar la reserva");
      }
    }, "Error al cargar la reserva");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/reservations");
    } else {
      const original = cancelEdit<Partial<Reservation>>();
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
    if (!formState.startDate || !formState.endDate) {
      showError("Debe completar todas las fechas y horarios");
      return false;
    }

    const startDate = parseDate(formState.startDate);
    const endDate = parseDate(formState.endDate);
    if (!startDate || !endDate || endDate <= startDate) {
      showError("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    const startDate = inputDateTimeToAPI(formState.startDate!);
    const endDate = inputDateTimeToAPI(formState.endDate!);

    executeSave(
      `¿Está seguro que desea ${actionText} esta reserva?`,
      () =>
        isNew
          ? createReservation({
              userId: formState.user!.id,
              vehicleId: formState.vehicle!.id,
              startDate,
              endDate,
            })
          : updateReservation(id!, {
              userId: formState.user!.id,
              vehicleId: formState.vehicle!.id,
              startDate,
              endDate,
            }),
      `Reserva ${actionText}da con éxito`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar esta reserva?",
      () => deleteReservation(id),
      "Reserva eliminada con éxito",
    );
  };

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
        />
      ),
    },
    {
      type: "fields",
      title: "Fechas y horarios",
      layout: "grid",
      columns: 2,
      fields: [
        {
          type: "datetime",
          value: toInputDateTimeSafe(formState.startDate),
          onChange: (value: string) => {
            setFormState((prev) => ({
              ...prev,
              startDate: value,
            }));
          },
          key: "startDate",
          label: "Fecha y hora inicio",
          required: true,
        },
        {
          type: "datetime",
          value: toInputDateTimeSafe(formState.endDate),
          onChange: (value: string) => {
            setFormState((prev) => ({
              ...prev,
              endDate: value,
            }));
          },
          key: "endDate",
          label: "Fecha y hora fin",
          required: true,
          min: toInputDateTimeSafe(formState.startDate),
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando reserva..." />;
  }

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: ROUTES.HOME },
          { label: "Reservas", href: ROUTES.RESERVATIONS },
          { label: isNew ? "Nueva reserva" : "Editar reserva" },
        ]}
        backButton={{
          text: "Volver",
          fallbackHref: ROUTES.RESERVATIONS,
        }}
      />
      <Form
        title={isNew ? "Nueva reserva" : "Editar reserva"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleDelete : undefined,
          saving,
          entityName: "Reserva",
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
