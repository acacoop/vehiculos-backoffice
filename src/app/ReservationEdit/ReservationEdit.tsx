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
import {
  UserSearch,
  VehicleSearch,
} from "../../components/EntitySearch/EntitySearch";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import DateTimePicker from "../../components/DateTimePicker/DateTimePicker";
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
    if (!startDate) {
      showError("Debe seleccionar una fecha de inicio");
      return false;
    }
    if (!endDate) {
      showError("Debe seleccionar una fecha de fin");
      return false;
    }
    if (!startTime) {
      showError("Debe seleccionar un horario de inicio");
      return false;
    }
    if (!endTime) {
      showError("Debe seleccionar un horario de fin");
      return false;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      showError(
        "La fecha y hora de inicio debe ser anterior a la fecha y hora de fin"
      );
      return false;
    }
    return true;
  };

  const checkExistingReservation = async (
    userId: string,
    vehicleId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    try {
      const response = await getAllReservations();

      if (response.success && response.data.length > 0) {
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        const hasConflict = response.data.some((reservation) => {
          if (
            reservation.userId !== userId ||
            reservation.vehicleId !== vehicleId
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
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

      const hasVehicleAssigned = await checkVehicleAssignment(
        userSearch.selectedUser!.id,
        vehicleSearch.selectedVehicle!.id
      );

      if (!hasVehicleAssigned) {
        showError(
          `No se puede generar la reserva ya que el usuario ${
            userSearch.selectedUser!.firstName
          } ${userSearch.selectedUser!.lastName} no cuenta con el auto ${
            vehicleSearch.selectedVehicle!.brand
          } ${vehicleSearch.selectedVehicle!.model} (${
            vehicleSearch.selectedVehicle!.licensePlate
          }) asignado`
        );
        setSaving(false);
        return;
      }

      const hasExistingReservation = await checkExistingReservation(
        userSearch.selectedUser!.id,
        vehicleSearch.selectedVehicle!.id,
        startDateTime,
        endDateTime
      );

      if (hasExistingReservation) {
        showError(
          `Ya existe una reserva para ${userSearch.selectedUser!.firstName} ${
            userSearch.selectedUser!.lastName
          } con el vehículo ${vehicleSearch.selectedVehicle!.brand} ${
            vehicleSearch.selectedVehicle!.model
          } (${
            vehicleSearch.selectedVehicle!.licensePlate
          }) en el período seleccionado`
        );
        setSaving(false);
        return;
      }

      const reservationData = {
        userId: userSearch.selectedUser!.id,
        vehicleId: vehicleSearch.selectedVehicle!.id,
        startDate: startDateTime,
        endDate: endDateTime,
      };

      const response = isCreateMode
        ? await createReservation(reservationData)
        : await updateReservation(reservationId!, reservationData);

      if (response.success) {
        showSuccess(
          `Reserva ${isCreateMode ? "creada" : "actualizada"} exitosamente`
        );

        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        const errorMessage = response.message || "";
        if (
          errorMessage.toLowerCase().includes("already reserved") ||
          errorMessage.toLowerCase().includes("ya reservado") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("duplicado") ||
          errorMessage.includes("500") ||
          errorMessage.toLowerCase().includes("conflict")
        ) {
          showError(
            `Ya existe una reserva para ${userSearch.selectedUser!.firstName} ${
              userSearch.selectedUser!.lastName
            } con este vehículo en el período seleccionado`
          );
        } else {
          showError(
            response.message ||
              `Error al ${isCreateMode ? "crear" : "actualizar"} la reserva`
          );
        }
      }
    } catch (err) {
      showError(`Error al ${isCreateMode ? "crear" : "actualizar"} la reserva`);
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

  return (
    <div className="edit-assignment-container">
      <div className="edit-assignment-card">
        <h1 className="title">
          {isCreateMode ? "Nueva Reserva" : "Editar Reserva"}
        </h1>

        {}
        {preloadedUserId && userSearch.selectedUser ? (
          <div className="user-info">
            <h2 className="section-title">Datos del Usuario</h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">DNI:</span>
                <span className="value">
                  {userSearch.selectedUser.dni?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <span className="value">
                  {userSearch.selectedUser.firstName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Apellido:</span>
                <span className="value">
                  {userSearch.selectedUser.lastName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{userSearch.selectedUser.email}</span>
              </div>
            </div>
          </div>
        ) : userSearch.selectedUser ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Usuario
              <button
                onClick={userSearch.clearSelection}
                className="clear-selection-btn"
                style={{
                  marginLeft: "10px",
                  fontSize: "0.8rem",
                  padding: "4px 8px",
                }}
              >
                Cambiar usuario
              </button>
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">DNI:</span>
                <span className="value">
                  {userSearch.selectedUser.dni?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <span className="value">
                  {userSearch.selectedUser.firstName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Apellido:</span>
                <span className="value">
                  {userSearch.selectedUser.lastName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{userSearch.selectedUser.email}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="user-info">
            <h2 className="section-title">Seleccionar Usuario</h2>
            <div className="user-search">
              <div className="form-group">
                <label htmlFor="userSearch" className="form-label">
                  Buscar usuario (por nombre, apellido, DNI o email)
                </label>
                <UserSearch
                  searchTerm={userSearch.searchTerm}
                  onSearchChange={userSearch.searchUsers}
                  availableUsers={userSearch.availableUsers}
                  showDropdown={userSearch.showDropdown}
                  onUserSelect={userSearch.selectUser}
                  onDropdownToggle={userSearch.setShowDropdown}
                />
              </div>
            </div>
          </div>
        )}

        {}
        {preloadedVehicleId && vehicleSearch.selectedVehicle ? (
          <div className="user-info">
            <h2 className="section-title">Datos del Vehículo</h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">Patente:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.licensePlate}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Marca:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.brand}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Modelo:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.model}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Año:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.year}
                </span>
              </div>
            </div>
          </div>
        ) : vehicleSearch.selectedVehicle ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Vehículo
              <button
                onClick={vehicleSearch.clearSelection}
                className="clear-selection-btn"
                style={{
                  marginLeft: "10px",
                  fontSize: "0.8rem",
                  padding: "4px 8px",
                }}
              >
                Cambiar vehículo
              </button>
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">Patente:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.licensePlate}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Marca:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.brand}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Modelo:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.model}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Año:</span>
                <span className="value">
                  {vehicleSearch.selectedVehicle.year}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="user-info">
            <h2 className="section-title">Seleccionar Vehículo</h2>
            <div className="vehicle-search">
              <div className="form-group">
                <label htmlFor="vehicleSearch" className="form-label">
                  Buscar vehículo (por patente, marca, modelo o año)
                </label>
                <VehicleSearch
                  searchTerm={vehicleSearch.searchTerm}
                  onSearchChange={vehicleSearch.searchVehicles}
                  availableVehicles={vehicleSearch.availableVehicles}
                  showDropdown={vehicleSearch.showDropdown}
                  onVehicleSelect={vehicleSearch.selectVehicle}
                  onDropdownToggle={vehicleSearch.setShowDropdown}
                />
              </div>
            </div>
          </div>
        )}

        {}
        <div className="assignment-form">
          <h2 className="section-title">Período de la Reserva</h2>

          <DateTimePicker
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            onStartDateChange={setStartDate}
            onStartTimeChange={setStartTime}
            onEndDateChange={setEndDate}
            onEndTimeChange={setEndTime}
            disabled={saving}
            minDate={new Date().toISOString().split("T")[0]}
          />
        </div>

        {}
        <div className="action-buttons">
          <button
            onClick={handleCancel}
            className="button-cancel"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="button-confirm"
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : isCreateMode
              ? "Crear Reserva"
              : "Actualizar Reserva"}
          </button>
        </div>
      </div>

      {}
      {notification.isOpen && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}
