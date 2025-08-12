import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAssignmentById,
  createAssignment,
  updateAssignment,
  finishAssignment,
  getAllAssignments,
} from "../../services/assignments";
import { getVehicleById } from "../../services/vehicles";
import { getUserById } from "../../services/users";
import { useUserSearch, useVehicleSearch } from "../../hooks";
import {
  UserSearch,
  VehicleSearch,
} from "../../components/EntitySearch/EntitySearch";
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

  // Hooks para búsqueda de entidades
  const userSearch = useUserSearch();
  const vehicleSearch = useVehicleSearch();

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

  // Función para verificar si se puede cambiar el usuario
  const canChangeUser = () => {
    // No se puede cambiar si estamos en modo editar (ya tiene usuario asignado)
    if (!isCreateMode) return false;

    // No se puede cambiar si el usuario viene precargado desde la URL
    if (preloadedUser) return false;

    // Solo se puede cambiar si el usuario fue seleccionado manualmente (no precargado)
    return userSearch.selectedUser !== null;
  };

  // Función para verificar si se puede cambiar el vehículo
  const canChangeVehicle = () => {
    // No se puede cambiar si estamos en modo editar (ya tiene vehículo asignado)
    if (!isCreateMode) return false;

    // No se puede cambiar si el vehículo viene precargado desde la URL
    if (preloadedVehicle) return false;

    // Solo se puede cambiar si el vehículo fue seleccionado manualmente
    return vehicleSearch.selectedVehicle !== null;
  };
  // Función para verificar si ya existe una asignación activa
  const checkExistingAssignment = async (
    userId: string,
    vehicleId: string
  ): Promise<boolean> => {
    try {
      const response = await getAllAssignments({
        userId,
        vehicleId,
      });

      if (response.success && response.data.length > 0) {
        // Verificar si alguna asignación está activa (no tiene fecha de fin o la fecha de fin es futura)
        const hasActiveAssignment = response.data.some((assignment) => {
          if (!assignment.endDate) return true; // Sin fecha de fin = indefinida = activa
          const endDate = new Date(assignment.endDate);
          return endDate > new Date(); // Fecha de fin en el futuro = activa
        });
        return hasActiveAssignment;
      }
      return false;
    } catch (error) {
      // En caso de error en la verificación, permitir continuar
      return false;
    }
  };

  const handleSave = async () => {
    if (!startDate) {
      showError("Por favor, complete la fecha de inicio");
      return;
    }

    if (isCreateMode) {
      if (!userSearch.selectedUser && !preloadedUser) {
        showError("Por favor, seleccione un usuario");
        return;
      }
      if (!preloadedVehicle && !vehicleSearch.selectedVehicle && !vehicleId) {
        showError("Por favor, seleccione un vehículo");
        return;
      }

      // Mostrar diálogo de confirmación para crear asignación
      showConfirm(
        "¿Está seguro que desea crear esta nueva asignación?",
        async () => {
          try {
            const finalUser = userSearch.selectedUser || preloadedUser;
            const finalVehicle =
              vehicleSearch.selectedVehicle || preloadedVehicle;

            if (!finalUser || !finalVehicle) {
              showError("Error: Usuario o vehículo no encontrado");
              return;
            }

            // Verificar si ya existe una asignación activa para este usuario y vehículo
            const hasExistingAssignment = await checkExistingAssignment(
              finalUser.id,
              finalVehicle.id
            );
            if (hasExistingAssignment) {
              showError(
                `El vehículo ${finalVehicle.brand} ${finalVehicle.model} (${finalVehicle.licensePlate}) ya se encuentra asignado a ${finalUser.firstName} ${finalUser.lastName}`
              );
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
              // Verificar si es un error de asignación duplicada
              const errorMessage = response.message || "";
              if (
                errorMessage.toLowerCase().includes("already assigned") ||
                errorMessage.toLowerCase().includes("ya asignado") ||
                errorMessage.toLowerCase().includes("duplicate") ||
                errorMessage.toLowerCase().includes("duplicado") ||
                errorMessage.includes("500") || // Internal server error que podría indicar conflicto
                errorMessage.toLowerCase().includes("conflict")
              ) {
                showError(
                  `Este vehículo ya se encuentra asignado a ${finalUser.firstName} ${finalUser.lastName}`
                );
              } else {
                showError(`Error al crear la asignación: ${response.message}`);
              }
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
            if (
              userSearch.selectedUser &&
              userSearch.selectedUser.id !== assignment.user.id
            ) {
              updateData.userId = userSearch.selectedUser.id;
            }
            if (
              vehicleSearch.selectedVehicle &&
              vehicleSearch.selectedVehicle.id !== assignment.vehicle.id
            ) {
              updateData.vehicleId = vehicleSearch.selectedVehicle.id;
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
        {assignment?.user || userSearch.selectedUser || preloadedUser ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Usuario
              {canChangeUser() && (
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
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">DNI:</span>
                <span className="value">
                  {(
                    assignment?.user?.dni ||
                    userSearch.selectedUser?.dni ||
                    preloadedUser?.dni
                  )?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <span className="value">
                  {assignment?.user?.firstName ||
                    userSearch.selectedUser?.firstName ||
                    preloadedUser?.firstName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Apellido:</span>
                <span className="value">
                  {assignment?.user?.lastName ||
                    userSearch.selectedUser?.lastName ||
                    preloadedUser?.lastName}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">
                  {assignment?.user?.email ||
                    userSearch.selectedUser?.email ||
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

        {/* Información del vehículo */}
        {assignment?.vehicle ||
        preloadedVehicle ||
        vehicleSearch.selectedVehicle ? (
          <div className="user-info">
            <h2 className="section-title">
              Datos del Vehículo
              {canChangeVehicle() && (
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
            </h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">Patente:</span>
                <span className="value">
                  {assignment?.vehicle?.licensePlate ||
                    preloadedVehicle?.licensePlate ||
                    vehicleSearch.selectedVehicle?.licensePlate}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Marca:</span>
                <span className="value">
                  {assignment?.vehicle?.brand ||
                    preloadedVehicle?.brand ||
                    vehicleSearch.selectedVehicle?.brand}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Modelo:</span>
                <span className="value">
                  {assignment?.vehicle?.model ||
                    preloadedVehicle?.model ||
                    vehicleSearch.selectedVehicle?.model}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Año:</span>
                <span className="value">
                  {assignment?.vehicle?.year ||
                    preloadedVehicle?.year ||
                    vehicleSearch.selectedVehicle?.year}
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
