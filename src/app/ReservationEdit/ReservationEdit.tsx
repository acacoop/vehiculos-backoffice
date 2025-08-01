import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  createReservation,
  updateReservation,
  getReservationById,
} from "../../services/reservations";
import { getUserById, getAllUsers } from "../../services/users";
import { getVehicleById, getAllVehicles } from "../../services/vehicles";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import "./ReservationEdit.css";

export default function ReservationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determinar si estamos en modo creación o edición
  const isCreateMode = !id;
  const reservationId = id;

  // Obtener parámetros de la URL
  const preloadedUserId = searchParams.get("userId");
  const preloadedVehicleId = searchParams.get("vehicleId");

  // Estados del formulario
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Estados de búsqueda
  const [userSearch, setUserSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isCreateMode && reservationId) {
        // Modo edición: cargar reserva existente
        setLoading(true);
        try {
          const response = await getReservationById(reservationId);
          if (response.success && response.data) {
            const reservation = response.data;
            const startDateTime = new Date(reservation.startDate);
            const endDateTime = new Date(reservation.endDate);

            setStartDate(startDateTime.toISOString().split("T")[0]); // Formato YYYY-MM-DD
            setEndDate(endDateTime.toISOString().split("T")[0]);

            // Extraer hora en formato 24h (HH:MM)
            const startHours = startDateTime
              .getHours()
              .toString()
              .padStart(2, "0");
            const startMinutes = startDateTime
              .getMinutes()
              .toString()
              .padStart(2, "0");
            const endHours = endDateTime.getHours().toString().padStart(2, "0");
            const endMinutes = endDateTime
              .getMinutes()
              .toString()
              .padStart(2, "0");

            setStartTime(`${startHours}:${startMinutes}`);
            setEndTime(`${endHours}:${endMinutes}`);

            // Cargar usuario y vehículo
            const [userResponse, vehicleResponse] = await Promise.all([
              getUserById(reservation.userId),
              getVehicleById(reservation.vehicleId),
            ]);

            if (userResponse.success) {
              setSelectedUser(userResponse.data);
              setUserSearch(
                `${userResponse.data.firstName} ${userResponse.data.lastName}`
              );
            }

            if (vehicleResponse.success) {
              setSelectedVehicle(vehicleResponse.data);
              setVehicleSearch(
                `${vehicleResponse.data.brand} ${vehicleResponse.data.model} (${vehicleResponse.data.licensePlate})`
              );
            }
          } else {
            setError(response.message || "Error al cargar la reserva");
          }
        } catch (err) {
          setError("Error al cargar la reserva");
        } finally {
          setLoading(false);
        }
      } else if (isCreateMode) {
        // Modo creación: precargar datos si vienen en los parámetros
        setLoading(true);
        try {
          if (preloadedUserId) {
            const userResponse = await getUserById(preloadedUserId);
            if (userResponse.success) {
              const user = userResponse.data;
              setSelectedUser(user);
              setUserSearch(`${user.firstName} ${user.lastName}`);
            }
          }

          if (preloadedVehicleId) {
            const vehicleResponse = await getVehicleById(preloadedVehicleId);
            if (vehicleResponse.success) {
              const vehicle = vehicleResponse.data;
              setSelectedVehicle(vehicle);
              setVehicleSearch(
                `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
              );
            }
          }
        } catch (err) {
          // Error no crítico en modo creación
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [isCreateMode, reservationId, preloadedUserId, preloadedVehicleId]);

  // Búsqueda de usuarios
  const handleUserSearch = async (searchTerm: string) => {
    setUserSearch(searchTerm);
    if (searchTerm.length > 2) {
      try {
        const response = await getAllUsers();
        if (response.success) {
          const filteredUsers = response.data.filter(
            (user) =>
              `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              user.dni?.toString().includes(searchTerm)
          );
          setAvailableUsers(filteredUsers);
          setShowUserDropdown(true);
        }
      } catch (error) {
        // Error en búsqueda de usuarios
      }
    } else {
      setShowUserDropdown(false);
    }
  };

  // Búsqueda de vehículos
  const handleVehicleSearch = async (searchTerm: string) => {
    setVehicleSearch(searchTerm);
    if (searchTerm.length > 2) {
      try {
        const response = await getAllVehicles();
        if (response.success) {
          const filteredVehicles = response.data.filter(
            (vehicle) =>
              `${vehicle.brand} ${vehicle.model}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              vehicle.licensePlate
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
          setAvailableVehicles(filteredVehicles);
          setShowVehicleDropdown(true);
        }
      } catch (error) {
        // Error en búsqueda de vehículos
      }
    } else {
      setShowVehicleDropdown(false);
    }
  };

  // Seleccionar usuario
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearch(`${user.firstName} ${user.lastName}`);
    setShowUserDropdown(false);
  };

  // Seleccionar vehículo
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleSearch(
      `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
    );
    setShowVehicleDropdown(false);
  };

  // Validar formulario
  const validateForm = () => {
    if (!selectedUser) {
      setError("Debe seleccionar un usuario");
      return false;
    }
    if (!selectedVehicle) {
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

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const reservationData = {
        userId: selectedUser!.id,
        vehicleId: selectedVehicle!.id,
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
            <h3>Información del Usuario</h3>

            {!preloadedUserId && (
              <div className="reservation-form-group">
                <label htmlFor="userSearch" className="reservation-form-label">
                  Buscar Usuario
                </label>
                <div className="user-search">
                  <input
                    id="userSearch"
                    type="text"
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    onFocus={() =>
                      userSearch.length > 2 && setShowUserDropdown(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowUserDropdown(false), 200)
                    }
                    placeholder="Buscar por nombre o DNI..."
                    className="reservation-form-input"
                  />
                  {showUserDropdown && availableUsers.length > 0 && (
                    <div className="user-dropdown">
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="user-dropdown-item"
                          onClick={() => handleUserSelect(user)}
                        >
                          {user.firstName} {user.lastName} - DNI: {user.dni}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="reservation-form-group">
                <label className="reservation-form-label">
                  Usuario Seleccionado
                </label>
                <input
                  type="text"
                  value={`${selectedUser.firstName} ${selectedUser.lastName} - DNI: ${selectedUser.dni}`}
                  disabled
                  className="reservation-form-input"
                />
              </div>
            )}
          </div>

          {/* Sección de Vehículo */}
          <div className="reservation-form-section">
            <h3>Información del Vehículo</h3>

            {!preloadedVehicleId && (
              <div className="reservation-form-group">
                <label
                  htmlFor="vehicleSearch"
                  className="reservation-form-label"
                >
                  Buscar Vehículo
                </label>
                <div className="vehicle-search">
                  <input
                    id="vehicleSearch"
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => handleVehicleSearch(e.target.value)}
                    onFocus={() =>
                      vehicleSearch.length > 2 && setShowVehicleDropdown(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowVehicleDropdown(false), 200)
                    }
                    placeholder="Buscar por marca, modelo o patente..."
                    className="reservation-form-input"
                  />
                  {showVehicleDropdown && availableVehicles.length > 0 && (
                    <div className="vehicle-dropdown">
                      {availableVehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="vehicle-dropdown-item"
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          {vehicle.brand} {vehicle.model} -{" "}
                          {vehicle.licensePlate}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedVehicle && (
              <div className="reservation-form-group">
                <label className="reservation-form-label">
                  Vehículo Seleccionado
                </label>
                <input
                  type="text"
                  value={`${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.licensePlate}`}
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
