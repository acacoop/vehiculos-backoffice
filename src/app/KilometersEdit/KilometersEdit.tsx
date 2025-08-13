import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { getVehicleById } from "../../services/vehicles";
import { useNotification } from "../../hooks/useNotification";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import {
  CancelButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components/Buttons/Buttons";
import type { Vehicle } from "../../types/vehicle";
import "./KilometersEdit.css";

export default function KilometersEdit() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isCreateMode = true;
  const preloadedVehicleId = vehicleId || searchParams.get("vehicleId");

  const [mileage, setMileage] = useState("");
  const [observations, setObservations] = useState("");
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const loadVehicleData = async () => {
      if (!preloadedVehicleId) {
        showError("ID de vehículo no proporcionado");
        return;
      }

      setLoading(true);
      try {
        const response = await getVehicleById(preloadedVehicleId);
        if (response.success && response.data) {
          setVehicleData(response.data);
        } else {
          showError(response.message || "Error al cargar datos del vehículo");
        }
      } catch (err) {
        showError(
          "Error al cargar datos del vehículo: " +
            (err instanceof Error ? err.message : "Error desconocido")
        );
      } finally {
        setLoading(false);
      }
    };

    loadVehicleData();
  }, [preloadedVehicleId]);

  const validateForm = () => {
    if (!mileage || mileage.trim() === "") {
      showError("Debe ingresar el kilometraje");
      return false;
    }

    const mileageNum = parseInt(mileage);
    if (isNaN(mileageNum) || mileageNum < 0) {
      showError("El kilometraje debe ser un número válido mayor a 0");
      return false;
    }

    if (!registrationDate) {
      showError("Debe seleccionar una fecha de registro");
      return false;
    }

    const selectedDate = new Date(registrationDate);
    const today = new Date();
    if (selectedDate > today) {
      showError("La fecha de registro no puede ser futura");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const mileageData = {
        vehicleId: preloadedVehicleId,
        mileage: parseInt(mileage),
        observations: observations.trim() || "Sin observaciones",
        registrationDate: registrationDate,
        createdBy: "Administrador",
      };

      const response = { success: true };

      if (response.success) {
        showSuccess("Registro de kilometraje creado exitosamente");

        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        showError("Error al crear el registro de kilometraje");
      }
    } catch (err) {
      showError("Error al crear el registro de kilometraje");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="kilometers-edit-container">
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="kilometers-edit-container">
        <div className="error-message">
          Error: No se pudieron cargar los datos del vehículo
        </div>
      </div>
    );
  }

  return (
    <div className="edit-assignment-container">
      <div className="edit-assignment-card">
        <h1 className="title">Nuevo Registro de Kilometraje</h1>

        {}
        <div className="user-info">
          <h2 className="section-title">Datos del Vehículo</h2>
          <div className="user-details">
            <div className="detail-item">
              <span className="label">Patente:</span>
              <span className="value">{vehicleData.licensePlate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Marca:</span>
              <span className="value">{vehicleData.brand}</span>
            </div>
            <div className="detail-item">
              <span className="label">Modelo:</span>
              <span className="value">{vehicleData.model}</span>
            </div>
            <div className="detail-item">
              <span className="label">Año:</span>
              <span className="value">{vehicleData.year}</span>
            </div>
          </div>
        </div>

        {}
        <div className="assignment-form">
          <h2 className="section-title">Registro de Kilometraje</h2>

          <div className="form-group">
            <label htmlFor="registrationDate" className="form-label">
              Fecha de Registro *
            </label>
            <input
              type="date"
              id="registrationDate"
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className="form-input"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mileage" className="form-label">
              Kilometraje *
            </label>
            <input
              type="number"
              id="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="Ingrese el kilometraje actual"
              className="form-input"
              disabled={saving}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observations" className="form-label">
              Observaciones
            </label>
            <textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ingrese observaciones adicionales (opcional)"
              className="form-input textarea-input"
              disabled={saving}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Registrado por</label>
            <div className="readonly-field">
              <span className="readonly-value">Administrador</span>
            </div>
          </div>
        </div>

        {}
        <ButtonGroup>
          <CancelButton
            text="Cancelar"
            onClick={handleCancel}
            disabled={saving}
          />
          <ConfirmButton
            text="Crear Registro"
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          />
        </ButtonGroup>
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
