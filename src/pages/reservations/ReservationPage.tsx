import { useParams, useLocation } from "react-router-dom";
import { Form, type FormButton, type FormSection } from "../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../hooks";
import {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
} from "../../services/reservations";
import { getVehicleById } from "../../services/vehicles";
import { getUserById } from "../../services/users";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import type { Vehicle } from "../../types/vehicle";
import type { User } from "../../types/user";
import {
  toInputDate,
  toInputTime,
  inputsToDate,
  dateToISO,
} from "../../common/date";

export default function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
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
  } = usePageState({ redirectOnSuccess: "/reservations" });

  useEffect(() => {
    if (!isNew && id) {
      loadReservation(id);
    }
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

  const loadReservation = async (reservationId: string) => {
    await executeLoad(async () => {
      const response = await getReservationById(reservationId);

      if (response.success && response.data) {
        const reservation = response.data;

        setFormData({
          startDate: new Date(reservation.startDate),
          endDate: new Date(reservation.endDate),
        });

        if (reservation.vehicle) {
          setVehicle(reservation.vehicle);
        }
        if (reservation.user) {
          setUser(reservation.user);
        }
      } else {
        showError(response.message || "Error al cargar la reserva");
      }
    }, "Error al cargar la reserva");
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
    if (!formData.startDate || !formData.endDate) {
      showError("Debe completar todas las fechas y horarios");
      return false;
    }

    if (formData.endDate <= formData.startDate) {
      showError("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} esta reserva?`,
      () =>
        isNew
          ? createReservation({
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: dateToISO(formData.startDate),
              endDate: dateToISO(formData.endDate),
            })
          : updateReservation(id!, {
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: dateToISO(formData.startDate),
              endDate: dateToISO(formData.endDate),
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
      title: "Fechas y Horarios",
      layout: "grid",
      columns: 2,
      fields: [
        {
          type: "date",
          value: toInputDate(formData.startDate),
          onChange: (dateValue: string) => {
            const timeStr = toInputTime(formData.startDate);
            setFormData({
              ...formData,
              startDate: inputsToDate(dateValue, timeStr),
            });
          },
          key: "startDate",
          label: "Fecha Inicio",
          required: true,
        },
        {
          type: "time",
          value: toInputTime(formData.startDate),
          onChange: (timeValue: string) => {
            const dateStr = toInputDate(formData.startDate);
            setFormData({
              ...formData,
              startDate: inputsToDate(dateStr, timeValue),
            });
          },
          key: "startTime",
          label: "Hora Inicio",
          required: true,
        },
        {
          type: "date",
          value: toInputDate(formData.endDate),
          onChange: (dateValue: string) => {
            const timeStr = toInputTime(formData.endDate);
            setFormData({
              ...formData,
              endDate: inputsToDate(dateValue, timeStr),
            });
          },
          key: "endDate",
          label: "Fecha Fin",
          required: true,
          min: toInputDate(formData.startDate),
        },
        {
          type: "time",
          value: toInputTime(formData.endDate),
          onChange: (timeValue: string) => {
            const dateStr = toInputDate(formData.endDate);
            setFormData({
              ...formData,
              endDate: inputsToDate(dateStr, timeValue),
            });
          },
          key: "endTime",
          label: "Hora Fin",
          required: true,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/reservations"),
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
        ? "Crear Reserva"
        : "Actualizar Reserva",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando reserva..." />;
  }

  return (
    <div>
      <Form
        title={isNew ? "Nueva Reserva" : "Editar Reserva"}
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
