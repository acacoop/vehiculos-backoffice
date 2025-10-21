import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "../../components";
import {
  createReservation,
  updateReservation,
  getReservationById,
  getAllReservations,
} from "../../services/reservations";
import { getAllAssignments } from "../../services/assignments";
import { getUserById } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import { useUserSearch, useVehicleSearch, useNotification } from "../../hooks";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import FormLayout from "../../components/FormLayout/FormLayout";
import { FieldType, EntityType } from "../../components/FormLayout/FormLayout";
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
    return <LoadingSpinner message="Cargando datos de la reserva..." />;
  }

  // Form fields configuration
  const formFields: any[] = [];

  // User data section (only if user is selected)
  if (userSearch.selectedUser) {
    formFields.push(
      {
        type: FieldType.DISPLAY,
        title: "CUIT",
        key: "cuit",
        value: userSearch.selectedUser.cuit?.toLocaleString() || "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Nombre",
        key: "firstName",
        value: userSearch.selectedUser.firstName || "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Apellido",
        key: "lastName",
        value: userSearch.selectedUser.lastName || "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Email",
        key: "email",
        value: userSearch.selectedUser.email || "",
      }
    );
  } else {
    // User search section
    formFields.push({
      type: FieldType.SEARCH,
      title: "Buscar usuario (por nombre, apellido, CUIT)",
      key: "userSearch",
      entityType: EntityType.USER,
      value: null,
      searchTerm: userSearch.searchTerm,
      onSearchChange: userSearch.searchUsers,
      availableEntities: userSearch.availableUsers,
      showDropdown: userSearch.showDropdown,
      onSelect: userSearch.selectUser,
      onDropdownToggle: userSearch.setShowDropdown,
      placeholder: "Buscar por nombre, apellido o CUIT...",
      required: true,
    });
  }

  // Vehicle data section (only if vehicle is selected)
  if (vehicleSearch.selectedVehicle) {
    formFields.push(
      {
        type: FieldType.DISPLAY,
        title: "Patente",
        key: "licensePlate",
        value: vehicleSearch.selectedVehicle.licensePlate || "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Marca",
        key: "brand",
        value:
          (vehicleSearch.selectedVehicle as any).brandName ||
          vehicleSearch.selectedVehicle.brand ||
          vehicleSearch.selectedVehicle.modelObj?.brand?.name ||
          "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Modelo",
        key: "model",
        value:
          (vehicleSearch.selectedVehicle as any).modelName ||
          vehicleSearch.selectedVehicle.model ||
          vehicleSearch.selectedVehicle.modelObj?.name ||
          "",
      },
      {
        type: FieldType.DISPLAY,
        title: "Año",
        key: "year",
        value: vehicleSearch.selectedVehicle.year?.toString() || "",
      }
    );
  } else {
    // Vehicle search section
    formFields.push({
      type: FieldType.SEARCH,
      title: "Buscar vehículo (por patente, marca, modelo o año)",
      key: "vehicleSearch",
      entityType: EntityType.VEHICLE,
      value: null,
      searchTerm: vehicleSearch.searchTerm,
      onSearchChange: vehicleSearch.searchVehicles,
      availableEntities: vehicleSearch.availableVehicles,
      showDropdown: vehicleSearch.showDropdown,
      onSelect: vehicleSearch.selectVehicle,
      onDropdownToggle: vehicleSearch.setShowDropdown,
      placeholder: "Buscar por patente, marca, modelo...",
      required: true,
    });
  }

  // Date and time section
  formFields.push({
    type: FieldType.DATETIME,
    title: "Seleccionar fechas y horarios",
    key: "datetime",
    value: "",
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
  });

  const buttonConfig = {
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
      type: "button" as const,
    },
    primary: {
      text: isCreateMode ? "Crear Reserva" : "Actualizar Reserva",
      onClick: handleSave,
      type: "submit" as const,
    },
  };

  return (
    <>
      <FormLayout
        title={isCreateMode ? "Nueva Reserva" : "Editar Reserva"}
        formFields={formFields}
        buttonConfig={buttonConfig}
        onFieldChange={() => {}} // Not used in this component
      />

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
