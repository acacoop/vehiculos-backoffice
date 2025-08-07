import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  createReservation,
  updateReservation,
  getReservationById,
} from "../../services/reservations";
import { getUserById } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import { useUserSearch, useVehicleSearch } from "../../hooks";
import {
  UserSearch,
  VehicleSearch,
} from "../../components/EntitySearch/EntitySearch";
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

  // Estados del formulario
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks para búsqueda de entidades
  const userSearch = useUserSearch();
  const vehicleSearch = useVehicleSearch();

  // Cargar datos iniciales
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

            // Cargar usuario
            if ("user" in reservation && reservation.user) {
              const user = reservation.user as User;
              userSearch.selectUser(user);
            } else if (reservation.userId) {
              const userResponse = await getUserById(reservation.userId);
              if (userResponse.success) {
                userSearch.selectUser(userResponse.data);
              }
            }

            // Cargar vehículo
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
            setError(response.message || "Error al cargar la reserva");
          }
        } catch (err) {
          setError(
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
          // Error silencioso para datos precargados
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [isCreateMode, reservationId, preloadedUserId, preloadedVehicleId]);

  // Validar formulario
  const validateForm = () => {
    if (!userSearch.selectedUser) {
      setError("Debe seleccionar un usuario");
      return false;
    }
    if (!vehicleSearch.selectedVehicle) {
      setError("Debe seleccionar un vehículo");
      return false;
    }
    if (!startDate) {
      setError("Debe seleccionar una fecha de inicio");
      return false;
    }
    if (!endDate) {
      setError("Debe seleccionar una fecha de fin");
      return false;
    }
    if (!startTime) {
      setError("Debe seleccionar un horario de inicio");
      return false;
    }
    if (!endTime) {
      setError("Debe seleccionar un horario de fin");
      return false;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setError(
        "La fecha y hora de inicio debe ser anterior a la fecha y hora de fin"
      );
      return false;
    }
    return true;
  };

  // Guardar reserva
  const handleSave = async () => {
    setError(null);
    if (!validateForm()) return;

    setSaving(true);
    try {
      const reservationData = {
        userId: userSearch.selectedUser!.id,
        vehicleId: vehicleSearch.selectedVehicle!.id,
        startDate: new Date(`${startDate}T${startTime}`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}`).toISOString(),
      };

      const response = isCreateMode
        ? await createReservation(reservationData)
        : await updateReservation(reservationId!, reservationData);

      if (response.success) {
        alert(
          `Reserva ${isCreateMode ? "creada" : "actualizada"} exitosamente`
        );
        navigate(-1);
      } else {
        setError(
          response.message ||
            `Error al ${isCreateMode ? "crear" : "actualizar"} la reserva`
        );
      }
    } catch (err) {
      setError(`Error al ${isCreateMode ? "crear" : "actualizar"} la reserva`);
    } finally {
      setSaving(false);
    }
  };

  // Cancelar
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
    <div className="reservation-edit-container">
      <div className="reservation-edit-content">
        <div className="reservation-edit-header">
          <h1 className="reservation-edit-title">
            {isCreateMode ? "Nueva Reserva" : "Editar Reserva"}
          </h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="reservation-form">
          {/* Sección de Usuario */}
          <div className="reservation-form-section">
            <h3>
              Información del Usuario
              {userSearch.selectedUser && (
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
              )}
            </h3>

            {!preloadedUserId && !userSearch.selectedUser && (
              <div className="reservation-form-group">
                <label htmlFor="userSearch" className="reservation-form-label">
                  Buscar Usuario
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
            )}

            {userSearch.selectedUser && (
              <div className="reservation-form-group">
                <label className="reservation-form-label">
                  Usuario Seleccionado
                </label>
                <input
                  type="text"
                  value={`${userSearch.selectedUser.firstName} ${userSearch.selectedUser.lastName} - DNI: ${userSearch.selectedUser.dni}`}
                  disabled
                  className="reservation-form-input"
                />
              </div>
            )}
          </div>

          {/* Sección de Vehículo */}
          <div className="reservation-form-section">
            <h3>
              Información del Vehículo
              {vehicleSearch.selectedVehicle && (
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
              )}
            </h3>

            {!preloadedVehicleId && !vehicleSearch.selectedVehicle && (
              <div className="reservation-form-group">
                <label
                  htmlFor="vehicleSearch"
                  className="reservation-form-label"
                >
                  Buscar Vehículo
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
            )}

            {vehicleSearch.selectedVehicle && (
              <div className="reservation-form-group">
                <label className="reservation-form-label">
                  Vehículo Seleccionado
                </label>
                <input
                  type="text"
                  value={`${vehicleSearch.selectedVehicle.brand} ${vehicleSearch.selectedVehicle.model} - ${vehicleSearch.selectedVehicle.licensePlate}`}
                  disabled
                  className="reservation-form-input"
                />
              </div>
            )}
          </div>

          {/* Sección de Fechas */}
          <div className="reservation-form-section">
            <h3>Período de la Reserva</h3>

            <div className="reservation-form-group">
              <label htmlFor="startDate" className="reservation-form-label">
                Fecha de Inicio
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label htmlFor="endDate" className="reservation-form-label">
                Fecha de Fin
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label htmlFor="startTime" className="reservation-form-label">
                Hora de Inicio
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label htmlFor="endTime" className="reservation-form-label">
                Hora de Fin
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="reservation-form-input"
              />
            </div>
          </div>
        </div>

        <div className="reservation-form-actions">
          <button
            type="button"
            className="reservation-btn reservation-btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="reservation-btn reservation-btn-primary"
            onClick={handleSave}
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
    </div>
  );
}
