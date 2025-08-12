import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAssignmentById,
  createAssignment,
  updateAssignment,
  finishAssignment,
} from "../../services/assignments";
import { getVehicleById, getVehicles } from "../../services/vehicles";
import { getUserById, getUsers } from "../../services/users";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { useConfirmDialog } from "../../hooks";
import { useNotification } from "../../hooks/useNotification";
import type { Assignment } from "../../types/assignment";
import type { Vehicle } from "../../types/vehicle";
import type { User } from "../../types/user";
import "./EditAssignment.css";

export default function EditAssignment() {
  const { assignmentId, vehicleId } = useParams<{
    assignmentId?: string;
    vehicleId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode = location.pathname.includes("/create");

  // Obtener userId de los query parameters
  const searchParams = new URLSearchParams(location.search);
  const userIdFromQuery = searchParams.get("userId");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modo crear
  const [preloadedVehicle, setPreloadedVehicle] = useState<Vehicle | null>(
    null
  );
  const [preloadedUser, setPreloadedUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Estados para búsqueda de usuarios
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Estados para búsqueda de vehículos
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState<string>("");
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false);

  // Hook para diálogos de confirmación
  const {
    isOpen: isConfirmOpen,
    message: confirmMessage,
    showConfirm,
    handleConfirm: confirmDialogConfirm,
    handleCancel: confirmDialogCancel,
  } = useConfirmDialog();

  // Hook para notificaciones
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);

        if (isCreateMode) {
          // Modo crear: cargar datos del vehículo si se proporciona vehicleId
          if (vehicleId) {
            const vehicleResponse = await getVehicleById(vehicleId);
            if (vehicleResponse.success) {
              setPreloadedVehicle(vehicleResponse.data);
            }
          }

          // Modo crear: cargar datos del usuario si se proporciona userId en query params
          if (userIdFromQuery) {
            const userResponse = await getUserById(userIdFromQuery);
            if (userResponse.success) {
              setPreloadedUser(userResponse.data);
            }
          }

          setLoading(false);
        } else {
          if (!assignmentId) {
            setError("ID de asignación no proporcionado");
            setLoading(false);
            return;
          }

          const response = await getAssignmentById(assignmentId);

          if (response.success && response.data) {
            setAssignment(response.data);
            setStartDate(response.data.startDate.split("T")[0]);
            setEndDate(
              response.data.endDate ? response.data.endDate.split("T")[0] : ""
            );
            setIsIndefinite(!response.data.endDate);
          } else {
            setError(response.message || "No se pudo cargar la asignación");
          }
        }
      } catch (error) {
        setError("Error al cargar los datos de la asignación");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, vehicleId, userIdFromQuery, isCreateMode]);

  // Efecto para cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-search")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para buscar usuarios
  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setAvailableUsers([]);
      setShowUserDropdown(false);
      return;
    }

    try {
      const response = await getUsers({ active: true }, { page: 1, limit: 10 });
      if (response.success) {
        const filteredUsers = response.data.filter(
          (user: User) =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.dni?.toString().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setAvailableUsers(filteredUsers);
        setShowUserDropdown(true);
      }
    } catch {
      setAvailableUsers([]);
      setShowUserDropdown(false);
    }
  };

  // Función para seleccionar un usuario
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowUserDropdown(false);
  };

  // Función para limpiar la selección de usuario
  const clearUserSelection = () => {
    setSelectedUser(null);
    setUserSearchTerm("");
    setAvailableUsers([]);
    setShowUserDropdown(false);
  };

  // Función para buscar vehículos
  const searchVehicles = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setAvailableVehicles([]);
      setShowVehicleDropdown(false);
      return;
    }

    try {
      const response = await getVehicles({}, { page: 1, limit: 100 });
      if (response.success) {
        const filteredVehicles = response.data.filter(
          (vehicle) =>
            vehicle.licensePlate
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.year?.toString().includes(searchTerm)
        );
        setAvailableVehicles(filteredVehicles);
        setShowVehicleDropdown(true);
      }
    } catch {
      setAvailableVehicles([]);
      setShowVehicleDropdown(false);
    }
  };

  // Función para seleccionar un vehículo
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleSearchTerm(
      `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`
    );
    setShowVehicleDropdown(false);
  };

  // Función para limpiar la selección de vehículo
  const clearVehicleSelection = () => {
    setSelectedVehicle(null);
    setVehicleSearchTerm("");
    setAvailableVehicles([]);
    setShowVehicleDropdown(false);
  };

  // Función para verificar si se puede cambiar el usuario
  const canChangeUser = () => {
    // No se puede cambiar si estamos en modo editar (ya tiene usuario asignado)
    if (!isCreateMode) return false;

    // No se puede cambiar si el usuario viene precargado desde la URL
    if (preloadedUser) return false;

    // Solo se puede cambiar si el usuario fue seleccionado manualmente (no precargado)
    return selectedUser !== null;
  };

  // Función para verificar si se puede cambiar el vehículo
  const canChangeVehicle = () => {
    // No se puede cambiar si estamos en modo editar (ya tiene vehículo asignado)
    if (!isCreateMode) return false;

    // No se puede cambiar si el vehículo viene precargado desde la URL
    if (preloadedVehicle) return false;

    // Solo se puede cambiar si el vehículo fue seleccionado manualmente
    return selectedVehicle !== null;
  };
  const handleSave = async () => {
    if (!startDate) {
      showError("Por favor, complete la fecha de inicio");
      return;
    }

    if (isCreateMode) {
      if (!selectedUser && !preloadedUser) {
        showError("Por favor, seleccione un usuario");
        return;
      }
      if (!preloadedVehicle && !selectedVehicle && !vehicleId) {
        showError("Por favor, seleccione un vehículo");
        return;
      }

      // Mostrar diálogo de confirmación para crear asignación
      showConfirm(
        "¿Está seguro que desea crear esta nueva asignación?",
        async () => {
          try {
            const finalUser = selectedUser || preloadedUser;
            const finalVehicle = selectedVehicle || preloadedVehicle;

            if (!finalUser || !finalVehicle) {
              showError("Error: Usuario o vehículo no encontrado");
              return;
            }

            const assignmentData = {
              userId: finalUser.id,
              vehicleId: finalVehicle.id,
              startDate: startDate,
              endDate: isIndefinite ? null : endDate || null,
              active: true,
            };

            const response = await createAssignment(assignmentData);

            if (response.success) {
              showSuccess("Nueva asignación creada exitosamente");
              // Esperar un poco para que se muestre la notificación antes de navegar
              setTimeout(() => {
                navigate(-1);
              }, 1500);
            } else {
              showError(`Error al crear la asignación: ${response.message}`);
            }
          } catch (error) {
            showError("Error al crear la asignación");
          }
        }
      );
    } else {
      // Mostrar diálogo de confirmación para actualizar asignación
      showConfirm(
        "¿Está seguro que desea guardar los cambios en esta asignación?",
        async () => {
          try {
            if (!assignmentId || !assignment) {
              showError("Error: ID de asignación no disponible");
              return;
            }

            // Preparar las fechas en formato ISO
            const startDateISO = new Date(
              startDate + "T00:00:00.000Z"
            ).toISOString();
            const endDateISO =
              isIndefinite || !endDate
                ? null
                : new Date(endDate + "T23:59:59.000Z").toISOString();

            const updateData: any = {
              startDate: startDateISO,
              endDate: endDateISO,
            };

            // Solo incluir userId y vehicleId si han cambiado
            if (selectedUser && selectedUser.id !== assignment.user.id) {
              updateData.userId = selectedUser.id;
            }
            if (
              selectedVehicle &&
              selectedVehicle.id !== assignment.vehicle.id
            ) {
              updateData.vehicleId = selectedVehicle.id;
            }

            const response = await updateAssignment(assignmentId, updateData);

            if (response.success) {
              showSuccess("Asignación actualizada exitosamente");
              // Esperar un poco para que se muestre la notificación antes de navegar
              setTimeout(() => {
                navigate(-1);
              }, 1500);
            } else {
              showError(
                `Error al actualizar la asignación: ${response.message}`
              );
            }
          } catch (error) {
            showError("Error al actualizar la asignación");
          }
        }
      );
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleUnassign = async () => {
    showConfirm(
      "¿Está seguro que desea desasignar este vehículo? Esta acción establecerá la fecha de fin de la asignación a hoy y no se puede deshacer.",
      async () => {
        try {
          if (!assignmentId) {
            showError("ID de asignación no disponible");
            return;
          }

          // Usar el servicio para finalizar la asignación
          const response = await finishAssignment(assignmentId);

          if (response.success) {
            showSuccess("Vehículo desasignado exitosamente");
            // Esperar un poco para que se muestre la notificación antes de navegar
            setTimeout(() => {
              navigate(-1);
            }, 1500);
          } else {
            showError(`Error al desasignar el vehículo: ${response.message}`);
          }
        } catch (error) {
          showError("Error al desasignar el vehículo");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="edit-assignment-container">
        <div className="loading">Cargando datos de la asignación...</div>
      </div>
    );
  }

  if (error || (!assignment && !isCreateMode)) {
    return (
      <div className="edit-assignment-container">
        <div className="error">
          {error || "No se pudo cargar la asignación"}
          <button onClick={handleCancel} className="button secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-assignment-container">
      <div className="edit-assignment-card">
        <h1 className="title">
          {isCreateMode ? "Nueva Asignación" : "Editar Asignación"}
        </h1>

        {/* Información del usuario */}
        {assignment?.user || selectedUser || preloadedUser ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Usuario
              {canChangeUser() && (
                <button
                  onClick={clearUserSelection}
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
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">DNI:</span>
                <span className="value">
                  {(
                    assignment?.user?.dni ||
                    selectedUser?.dni ||
                    preloadedUser?.dni
                  )?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <span className="value">
                  {assignment?.user?.firstName ||
                    selectedUser?.firstName ||
                    preloadedUser?.firstName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Apellido:</span>
                <span className="value">
                  {assignment?.user?.lastName ||
                    selectedUser?.lastName ||
                    preloadedUser?.lastName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">
                  {assignment?.user?.email ||
                    selectedUser?.email ||
                    preloadedUser?.email}
                </span>
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
                <input
                  type="text"
                  id="userSearch"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="form-input"
                  placeholder="Escriba para buscar..."
                />
              </div>

              {showUserDropdown && availableUsers.length > 0 && (
                <div className="user-dropdown">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="user-dropdown-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                      <br />
                      <small>
                        DNI: {user.dni?.toLocaleString()} - {user.email}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del vehículo */}
        {assignment?.vehicle || preloadedVehicle || selectedVehicle ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Vehículo
              {canChangeVehicle() && (
                <button
                  onClick={clearVehicleSelection}
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
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">Patente:</span>
                <span className="value">
                  {assignment?.vehicle?.licensePlate ||
                    preloadedVehicle?.licensePlate ||
                    selectedVehicle?.licensePlate}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Marca:</span>
                <span className="value">
                  {assignment?.vehicle?.brand ||
                    preloadedVehicle?.brand ||
                    selectedVehicle?.brand}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Modelo:</span>
                <span className="value">
                  {assignment?.vehicle?.model ||
                    preloadedVehicle?.model ||
                    selectedVehicle?.model}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Año:</span>
                <span className="value">
                  {assignment?.vehicle?.year ||
                    preloadedVehicle?.year ||
                    selectedVehicle?.year}
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
                <input
                  type="text"
                  id="vehicleSearch"
                  value={vehicleSearchTerm}
                  onChange={(e) => {
                    setVehicleSearchTerm(e.target.value);
                    searchVehicles(e.target.value);
                  }}
                  className="form-input"
                  placeholder="Escriba para buscar..."
                />
              </div>

              {showVehicleDropdown && availableVehicles.length > 0 && (
                <div className="user-dropdown">
                  {availableVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="user-dropdown-item"
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <strong>
                        {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                      </strong>
                      <br />
                      <small>Año: {vehicle.year}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de asignación */}
        <div className="assignment-form">
          <h2 className="section-title">Período de Asignación</h2>

          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Fecha Desde <span className="required">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isIndefinite"
                checked={isIndefinite}
                onChange={(e) => setIsIndefinite(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="isIndefinite" className="checkbox-label">
                Asignación indefinida (sin fecha de fin)
              </label>
            </div>
          </div>

          {!isIndefinite && (
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                Fecha Hasta
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                min={startDate}
              />
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button onClick={handleCancel} className="button-cancel">
            Cancelar
          </button>
          {!isCreateMode && (
            <button onClick={handleUnassign} className="button-unassign">
              Desasignar Vehículo
            </button>
          )}
          <button onClick={handleSave} className="button-confirm">
            {isCreateMode ? "Crear Asignación" : "Guardar Asignación"}
          </button>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        open={isConfirmOpen}
        message={confirmMessage}
        onConfirm={confirmDialogConfirm}
        onCancel={confirmDialogCancel}
      />

      {/* Componente de notificación */}
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
