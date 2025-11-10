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
import { getAssignments } from "../../services/assignments";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import type { Vehicle } from "../../types/vehicle";
import type { User } from "../../types/user";
import type { Assignment } from "../../types/assignment";

export default function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
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

        const startDateTime = new Date(reservation.startDate);
        const endDateTime = new Date(reservation.endDate);

        setFormData({
          startDate: startDateTime.toISOString().split("T")[0],
          endDate: endDateTime.toISOString().split("T")[0],
          startTime: startDateTime.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endDateTime.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
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
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      showError("Debe completar todas las fechas y horarios");
      return false;
    }

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`,
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      showError("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }

    const now = new Date();
    if (startDateTime <= now) {
      showError("La fecha de inicio debe ser futura");
      return false;
    }

    return true;
  };

  const checkVehicleAssignment = async (): Promise<boolean> => {
    try {
      if (user && vehicle) {
        const response = await getAssignments({
          filters: { userId: user.id, vehicleId: vehicle.id },
          pagination: { limit: 1000, offset: 0 },
        });

        if (response.success && response.data && response.data.length > 0) {
          const hasActiveAssignment = response.data.some(
            (assignment: Assignment) => {
              if (!assignment.endDate) return true;
              const endDate = new Date(assignment.endDate);
              return endDate > new Date();
            },
          );
          return hasActiveAssignment;
        }
        return false;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const hasActiveAssignment = await checkVehicleAssignment();
    if (!hasActiveAssignment) {
      showError(
        "El usuario debe tener una asignación activa del vehículo para crear la reserva",
      );
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} esta reserva?`,
      () =>
        isNew
          ? createReservation({
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: new Date(
                `${formData.startDate}T${formData.startTime}`,
              ).toISOString(),
              endDate: new Date(
                `${formData.endDate}T${formData.endTime}`,
              ).toISOString(),
            })
          : updateReservation(id!, {
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: new Date(
                `${formData.startDate}T${formData.startTime}`,
              ).toISOString(),
              endDate: new Date(
                `${formData.endDate}T${formData.endTime}`,
              ).toISOString(),
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
      render: <UserEntitySearch user={user} onUserChange={setUser} />,
    },
    {
      type: "entity",
      render: (
        <VehicleEntitySearch vehicle={vehicle} onVehicleChange={setVehicle} />
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
          value: formData.startDate,
          onChange: (value: string) =>
            setFormData({ ...formData, startDate: value }),
          key: "startDate",
          label: "Fecha Inicio",
          required: true,
          min: new Date().toISOString().split("T")[0],
        },
        {
          type: "text",
          value: formData.startTime,
          onChange: (value: string) =>
            setFormData({ ...formData, startTime: value }),
          key: "startTime",
          label: "Hora Inicio",
          placeholder: "HH:MM",
          required: true,
        },
        {
          type: "date",
          value: formData.endDate,
          onChange: (value: string) =>
            setFormData({ ...formData, endDate: value }),
          key: "endDate",
          label: "Fecha Fin",
          required: true,
          min: formData.startDate,
        },
        {
          type: "text",
          value: formData.endTime,
          onChange: (value: string) =>
            setFormData({ ...formData, endTime: value }),
          key: "endTime",
          label: "Hora Fin",
          placeholder: "HH:MM",
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
