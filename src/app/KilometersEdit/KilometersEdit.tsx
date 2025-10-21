import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "../../components";
import { getMe } from "../../services/users";
import VehicleKilometersService from "../../services/kilometers";
import { getVehicleById } from "../../services/vehicles";
import { useNotification } from "../../hooks";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import FormLayout from "../../components/FormLayout/FormLayout";
import { FieldType, InputType } from "../../components/FormLayout/FormLayout";
import type { Vehicle } from "../../types/vehicle";
import "./KilometersEdit.css";
import { getVehicleModel } from "../../common/utils";

export default function KilometersEdit() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preloadedVehicleId = vehicleId || searchParams.get("vehicleId");

  const [mileage, setMileage] = useState("");
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [currentUserName, setCurrentUserName] =
    useState<string>("Administrador");

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
    // load current user display name
    const loadCurrentUser = async () => {
      try {
        const res = await getMe();
        if (res.success && res.data) {
          setCurrentUserName(`${res.data.firstName} ${res.data.lastName}`);
        }
      } catch (err) {
        // ignore, keep default
      }
    };
    loadCurrentUser();
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
      // Ensure we have a vehicleId
      if (!preloadedVehicleId) {
        showError("ID de vehículo no disponible");
        return;
      }

      // Get current user to set as createdBy
      const me = await getMe();
      if (!me.success || !me.data) {
        showError("No se pudo obtener el usuario actual para el registro");
        return;
      }

      const payload = {
        userId: me.data.id,
        date: registrationDate,
        kilometers: parseInt(mileage, 10),
      };

      const created = await VehicleKilometersService.createKilometersLog(
        preloadedVehicleId,
        payload
      );

      if (created && created.id) {
        showSuccess("Registro de kilometraje creado exitosamente");
        setTimeout(() => navigate(-1), 1200);
      } else {
        showError("Error al crear el registro de kilometraje");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(`Error al crear el registro de kilometraje: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos del vehículo..." />;
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

  const handleFieldChange = (key: string, value: any) => {
    switch (key) {
      case "registrationDate":
        setRegistrationDate(value);
        break;
      case "mileage":
        setMileage(value.toString());
        break;
    }
  };

  const formFields: any[] = [
    // Datos del vehículo (readonly)
    {
      type: FieldType.TEXT_FIXED,
      title: "Patente:",
      value: vehicleData.licensePlate || "",
      key: "licensePlate",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Marca:",
      value: vehicleData.brand || "",
      key: "brand",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Modelo:",
      value: getVehicleModel(vehicleData) || "",
      key: "model",
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Año:",
      value: vehicleData.year?.toString() || "",
      key: "year",
    },
    // Campos editables
    {
      type: FieldType.DATE,
      title: "Fecha de Registro:",
      value: registrationDate,
      key: "registrationDate",
      required: true,
      validation: (value: string) => ({
        isValid: !!value,
        message: "La fecha es requerida",
      }),
    },
    {
      type: FieldType.INPUT,
      title: "Kilometraje:",
      value: mileage,
      key: "mileage",
      inputType: InputType.NUMBER,
      required: true,
      placeholder: "Ingrese el kilometraje actual",
      min: 0,
      validation: (value: number) => ({
        isValid: value >= 0,
        message: "El kilometraje debe ser mayor o igual a 0",
      }),
    },
    {
      type: FieldType.TEXT_FIXED,
      title: "Registrado por:",
      value: currentUserName,
      key: "registradoPor",
    },
  ];

  const buttonConfig = {
    primary: {
      text: saving ? "Guardando..." : "Crear Registro",
      onClick: handleSave,
    },
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
  };

  return (
    <>
      <div className="kilometers-edit-container">
        <FormLayout
          title="Nuevo Registro de Kilometraje"
          formFields={formFields}
          buttonConfig={buttonConfig}
          onFieldChange={handleFieldChange}
        />

        {notification.isOpen && (
          <NotificationToast
            message={notification.message}
            type={notification.type}
            isOpen={notification.isOpen}
            onClose={closeNotification}
          />
        )}
      </div>
    </>
  );
}
