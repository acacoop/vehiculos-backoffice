import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  createReservation,
  updateReservation,
  getReservationById,
  getAllReservations,
} from "../../services/reservations";
import { getAllAssignments } from "../../services/assignments";
import { getUserById } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import { useUserSearch, useVehicleSearch } from "../../hooks";
import { useNotification } from "../../hooks/useNotification";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import FormLayout from "../../components/FormLayout/FormLayout";
import type { FormSection } from "../../components/FormLayout/FormLayout";
import {
  CancelButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components/Buttons/Buttons";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import "./ReservationEdit.css";

export default function ReservationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isCreateMode = !id;
  const reservationId = id;
  const preloadedUserId = searchParams.get("userId");
  const preloadedVehicleId = searchParams.get("vehicleId");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userSearch = useUserSearch();
  const vehicleSearch = useVehicleSearch();

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isCreateMode && reservationId) {
        setLoading(true);
        try {
          const response = await getReservationById(reservationId);

          if (response.success && response.data) {
            const reservation = response.data;

            const startDateTime = new Date(reservation.startDate);
            const endDateTime = new Date(reservation.endDate);

            setStartDate(startDateTime.toISOString().split("T")[0]);
            setEndDate(endDateTime.toISOString().split("T")[0]);
            setStartTime(
              `${startDateTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${startDateTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            );
            setEndTime(
              `${endDateTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${endDateTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            );

            if ("user" in reservation && reservation.user) {
              const user = reservation.user as User;
              userSearch.selectUser(user);
            } else if (reservation.userId) {
              const userResponse = await getUserById(reservation.userId);
              if (userResponse.success) {
                userSearch.selectUser(userResponse.data);
              }
            }

            if ("vehicle" in reservation && reservation.vehicle) {
              const vehicle = reservation.vehicle as Vehicle;
              vehicleSearch.selectVehicle(vehicle);
            } else if (reservation.vehicleId) {
              const vehicleResponse = await getVehicleById(
                reservation.vehicleId
              );
              if (vehicleResponse.success) {
                vehicleSearch.selectVehicle(vehicleResponse.data);
              }
            }
          } else {
            showError(response.message || "Error al cargar la reserva");
          }
        } catch (err) {
          showError(
            "Error al cargar la reserva: " +
              (err instanceof Error ? err.message : "Error desconocido")
          );
        } finally {
          setLoading(false);
        }
      } else if (isCreateMode) {
        setLoading(true);
        try {
          if (preloadedUserId) {
            const userResponse = await getUserById(preloadedUserId);
            if (userResponse.success) {
              userSearch.selectUser(userResponse.data);
            }
          }
          if (preloadedVehicleId) {
            const vehicleResponse = await getVehicleById(preloadedVehicleId);
            if (vehicleResponse.success) {
              vehicleSearch.selectVehicle(vehicleResponse.data);
            }
          }
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [isCreateMode, reservationId, preloadedUserId, preloadedVehicleId]);

  const validateForm = () => {
    if (!userSearch.selectedUser) {
      showError("Debe seleccionar un usuario");
      return false;
    }
    if (!vehicleSearch.selectedVehicle) {
      showError("Debe seleccionar un vehículo");
      return false;
    }
    if (!startDate || !endDate || !startTime || !endTime) {
      showError("Debe completar todas las fechas y horarios");
      return false;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

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

  const checkConflicts = async (): Promise<boolean> => {
    try {
      if (userSearch.selectedUser && vehicleSearch.selectedVehicle) {
        const newStartDate = new Date(`${startDate}T${startTime}`);
        const newEndDate = new Date(`${endDate}T${endTime}`);

        const reservationsResponse = await getAllReservations();

        const hasConflict = reservationsResponse.data?.some((reservation) => {
          if (
            reservation.vehicleId !== vehicleSearch.selectedVehicle?.id &&
            reservation.userId !== userSearch.selectedUser?.id
          ) {
            return false;
          }

          if (!isCreateMode && reservation.id === reservationId) {
            return false;
          }

          const existingStartDate = new Date(reservation.startDate);
          const existingEndDate = new Date(reservation.endDate);

          return (
            (newStartDate >= existingStartDate &&
              newStartDate <= existingEndDate) ||
            (newEndDate >= existingStartDate &&
              newEndDate <= existingEndDate) ||
            (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
          );
        });

        return hasConflict;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const checkVehicleAssignment = async (
    userId: string,
    vehicleId: string
  ): Promise<boolean> => {
    try {
      const response = await getAllAssignments({
        userId,
        vehicleId,
      });

      if (response.success && response.data.length > 0) {
        const hasActiveAssignment = response.data.some((assignment) => {
          if (!assignment.endDate) return true;
          const endDate = new Date(assignment.endDate);
          return endDate > new Date();
        });
        return hasActiveAssignment;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const hasConflict = await checkConflicts();
      if (hasConflict) {
        showError(
          "Ya existe una reserva para este usuario o vehículo en el horario seleccionado"
        );
        setSaving(false);
        return;
      }

      const hasActiveAssignment = await checkVehicleAssignment(
        userSearch.selectedUser!.id,
        vehicleSearch.selectedVehicle!.id
      );

      if (!hasActiveAssignment) {
        showError(
          "El usuario debe tener una asignación activa del vehículo para crear la reserva"
        );
        setSaving(false);
        return;
      }

      const reservationData = {
        userId: userSearch.selectedUser!.id,
        vehicleId: vehicleSearch.selectedVehicle!.id,
        startDate: new Date(`${startDate}T${startTime}`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}`).toISOString(),
      };

      let response;
      if (isCreateMode) {
        response = await createReservation(reservationData);
      } else {
        response = await updateReservation(reservationId!, reservationData);
      }

      if (response.success) {
        showSuccess(
          isCreateMode
            ? "Reserva creada exitosamente"
            : "Reserva actualizada exitosamente"
        );

        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        showError(
          response.message ||
            `Error al ${isCreateMode ? "crear" : "actualizar"} la reserva`
        );
      }
    } catch (err) {
      showError(
        `Error al ${isCreateMode ? "crear" : "actualizar"} la reserva: ` +
          (err instanceof Error ? err.message : "Error desconocido")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="reservation-edit-container">
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      </div>
    );
  }

  // Configuración de secciones para FormLayout
  const sections: FormSection[] = [];

  // Sección de datos del usuario (solo si hay usuario seleccionado)
  if (userSearch.selectedUser) {
    sections.push({
      title: "Datos del Usuario",
      horizontal: true,
      // Solo mostrar botón de cambio si el usuario NO vino precargado
      actionButton: !preloadedUserId
        ? {
            text: "Cambiar usuario",
            onClick: () => userSearch.clearSelection(),
          }
        : undefined,
      fields: [
        {
          key: "dni",
          label: "DNI:",
          type: "text",
          value: userSearch.selectedUser.dni?.toLocaleString() || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "firstName",
          label: "Nombre:",
          type: "text",
          value: userSearch.selectedUser.firstName || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "lastName",
          label: "Apellido:",
          type: "text",
          value: userSearch.selectedUser.lastName || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "email",
          label: "Email:",
          type: "email",
          value: userSearch.selectedUser.email || "",
          onChange: () => {},
          disabled: true,
        },
      ],
    });
  } else {
    // Sección para buscar usuario
    sections.push({
      title: "Seleccionar Usuario",
      fields: [
        {
          key: "userSearch",
          label: "Buscar usuario (por nombre o DNI)",
          type: "userSearch",
          value: "",
          onChange: () => {},
          entitySearch: true,
          searchTerm: userSearch.searchTerm,
          onSearchChange: userSearch.searchUsers,
          availableUsers: userSearch.availableUsers,
          showDropdown: userSearch.showDropdown,
          onUserSelect: userSearch.selectUser,
          onDropdownToggle: userSearch.setShowDropdown,
          placeholder: "Buscar por nombre o DNI...",
          required: true,
        },
      ],
    });
  }

  // Sección de datos del vehículo (solo si hay vehículo seleccionado)
  if (vehicleSearch.selectedVehicle) {
    sections.push({
      title: "Datos del Vehículo",
      horizontal: true,
      // Solo mostrar botón de cambio si el vehículo NO vino precargado
      actionButton: !preloadedVehicleId
        ? {
            text: "Cambiar vehículo",
            onClick: () => vehicleSearch.clearSelection(),
          }
        : undefined,
      fields: [
        {
          key: "licensePlate",
          label: "Patente:",
          type: "text",
          value: vehicleSearch.selectedVehicle.licensePlate || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "brand",
          label: "Marca:",
          type: "text",
          value: vehicleSearch.selectedVehicle.brand || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "model",
          label: "Modelo:",
          type: "text",
          value: vehicleSearch.selectedVehicle.model || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "year",
          label: "Año:",
          type: "number",
          value: vehicleSearch.selectedVehicle.year || 0,
          onChange: () => {},
          disabled: true,
        },
      ],
    });
  } else {
    // Sección para buscar vehículo
    sections.push({
      title: "Seleccionar Vehículo",
      fields: [
        {
          key: "vehicleSearch",
          label: "Buscar vehículo (por patente, marca, modelo o año)",
          type: "vehicleSearch",
          value: "",
          onChange: () => {},
          entitySearch: true,
          searchTerm: vehicleSearch.searchTerm,
          onSearchChange: vehicleSearch.searchVehicles,
          availableVehicles: vehicleSearch.availableVehicles,
          showDropdown: vehicleSearch.showDropdown,
          onVehicleSelect: vehicleSearch.selectVehicle,
          onDropdownToggle: vehicleSearch.setShowDropdown,
          placeholder: "Buscar por patente, marca, modelo...",
          required: true,
        },
      ],
    });
  }

  // Sección de fechas y horarios
  sections.push({
    title: "Fechas y Horarios",
    fields: [
      {
        key: "datetime",
        label: "Seleccionar fechas y horarios",
        type: "datetime",
        value: "",
        onChange: () => {},
        dateTimePicker: true,
        startDate,
        startTime,
        endDate,
        endTime,
        onStartDateChange: setStartDate,
        onStartTimeChange: setStartTime,
        onEndDateChange: setEndDate,
        onEndTimeChange: setEndTime,
        minDate: new Date().toISOString().split("T")[0],
        disabled: saving,
        required: true,
      },
    ],
  });

  return (
    <>
      <FormLayout
        title={isCreateMode ? "Nueva Reserva" : "Editar Reserva"}
        sections={sections}
      >
        <ButtonGroup>
          <CancelButton
            text="Cancelar"
            onClick={handleCancel}
            disabled={saving}
          />
          <ConfirmButton
            text={isCreateMode ? "Crear Reserva" : "Actualizar Reserva"}
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          />
        </ButtonGroup>
      </FormLayout>

      {notification.isOpen && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      )}
    </>
  );
}
