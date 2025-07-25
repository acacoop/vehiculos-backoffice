import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserById } from "../../services/users";
import { getVehicleById } from "../../services/vehicles";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import "./UserEditAssignment.css";

export default function UserEditAssignment() {
  const { userId, vehicleId } = useParams<{
    userId: string;
    vehicleId: string;
  }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !vehicleId) {
        setError("ID de usuario o vehículo no proporcionado");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "🔍 [USER_EDIT_ASSIGNMENT] Cargando datos del usuario y vehículo:",
          { userId, vehicleId }
        );

        // Cargar datos del usuario y vehículo en paralelo
        const [userResponse, vehicleResponse] = await Promise.all([
          getUserById(userId),
          getVehicleById(vehicleId),
        ]);

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);

          // Establecer fecha por defecto para "desde" (hoy)
          const today = new Date().toISOString().split("T")[0];
          setStartDate(today);
        } else {
          setError(
            userResponse.message ||
              "No se pudieron cargar los datos del usuario"
          );
        }

        if (vehicleResponse.success && vehicleResponse.data) {
          setVehicle(vehicleResponse.data);
        } else {
          setError(
            vehicleResponse.message ||
              "No se pudieron cargar los datos del vehículo"
          );
        }
      } catch (error) {
        console.error(
          "❌ [USER_EDIT_ASSIGNMENT] Error al cargar datos:",
          error
        );
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, vehicleId]);

  const handleSave = async () => {
    if (!user || !startDate) {
      alert("Por favor, complete todos los campos requeridos");
      return;
    }

    try {
      console.log("💾 [USER_EDIT_ASSIGNMENT] Guardando asignación:", {
        userId: user.id,
        startDate,
        endDate: isIndefinite ? null : endDate,
      });

      // TODO: Implementar llamada al servicio para crear asignación
      alert("Asignación guardada exitosamente");
      navigate(-1); // Volver a la página anterior
    } catch (error) {
      console.error(
        "❌ [USER_EDIT_ASSIGNMENT] Error al guardar asignación:",
        error
      );
      alert("Error al guardar la asignación");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Volver a la página anterior
  };

  if (loading) {
    return (
      <div className="user-edit-assignment-container">
        <div className="loading">Cargando datos del usuario...</div>
      </div>
    );
  }

  if (error || !user || !vehicle) {
    return (
      <div className="user-edit-assignment-container">
        <div className="error">
          {error || "No se pudieron cargar los datos"}
          <button onClick={handleCancel} className="button secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-edit-assignment-container">
      <div className="user-edit-assignment-card">
        <h1 className="title">Asignación de Usuario</h1>

        {/* Información del usuario */}
        <div className="user-info">
          <h2 className="section-title">Datos del Usuario</h2>
          <div className="user-details">
            <div className="detail-item">
              <span className="label">DNI:</span>
              <span className="value">{user.dni?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Nombre:</span>
              <span className="value">{user.firstName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Apellido:</span>
              <span className="value">{user.lastName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Información del vehículo */}
        <div className="user-info">
          <h2 className="section-title">Datos del Vehículo</h2>
          <div className="user-details">
            <div className="detail-item">
              <span className="label">Patente:</span>
              <span className="value">{vehicle.licensePlate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Marca:</span>
              <span className="value">{vehicle.brand}</span>
            </div>
            <div className="detail-item">
              <span className="label">Modelo:</span>
              <span className="value">{vehicle.model}</span>
            </div>
            <div className="detail-item">
              <span className="label">Año:</span>
              <span className="value">{vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Formulario de asignación */}
        <div className="assignment-form">
          <h2 className="section-title">Período de Asignación</h2>

          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Fecha Desde *
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
          <button onClick={handleSave} className="button-confirm">
            Guardar Asignación
          </button>
        </div>
      </div>
    </div>
  );
}
