import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { getVehicleById, updateVehicle } from "../../services/vehicles";
import { getUserById } from "../../services/users";
import {
  ConfirmDialog,
  NotificationToast,
  ConfirmButton,
  LoadingSpinner,
} from "../";
import { useNotification } from "../../hooks";
import "./EntityForm.css";

type FieldType = "text" | "email" | "number";

type FormField = {
  key: string;
  label: string;
  type: FieldType;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
};

type EntityType = "user" | "vehicle" | "technical";

const ENTITY_CONFIGS: Record<
  EntityType,
  {
    title: (isEdit?: boolean) => string;
    fields: FormField[];
    confirmButtonText: (isEdit?: boolean) => string;
    confirmDialogTitle: (isEdit?: boolean) => string;
    confirmDialogMessage: (isEdit?: boolean) => string;
  }
> = {
  user: {
    title: () => "Detalles del usuario",
    fields: [
      {
        key: "firstName",
        label: "Nombre",
        type: "text",
        readOnly: true,
        disabled: true,
      },
      {
        key: "lastName",
        label: "Apellido",
        type: "text",
        readOnly: true,
        disabled: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        readOnly: true,
        disabled: true,
      },
      {
        key: "dni",
        label: "DNI",
        type: "text",
        readOnly: true,
        disabled: true,
      },
    ],
    confirmButtonText: () => "Confirmar",
    confirmDialogTitle: () => "Confirmar cambios",
    confirmDialogMessage: () =>
      "¿Estás seguro de que quieres guardar los cambios?",
  },
  vehicle: {
    title: (isEdit) =>
      isEdit ? "Detalles del Vehículo" : "Información del Nuevo Vehículo",
    fields: [
      { key: "licensePlate", label: "Dominio", type: "text" },
      { key: "brand", label: "Marca", type: "text" },
      { key: "model", label: "Modelo", type: "text" },
      { key: "year", label: "Año", type: "number", className: "no-spinner" },
    ],
    confirmButtonText: (isEdit) => (isEdit ? "Confirmar" : "Guardar"),
    confirmDialogTitle: (isEdit) =>
      isEdit ? "Confirmar cambios" : "Guardar información",
    confirmDialogMessage: (isEdit) =>
      isEdit
        ? "¿Estás seguro de que quieres guardar los cambios en este vehículo?"
        : "¿Estás seguro de que quieres guardar la información del vehículo?",
  },
  technical: {
    title: () => "Ficha Técnica",
    fields: [
      { key: "nroChasis", label: "Nro de Chasis", type: "text" },
      { key: "nroMotor", label: "Nro de Motor", type: "text" },
      { key: "tipo", label: "Tipo", type: "text" },
      { key: "transmicion", label: "Transmisión", type: "text" },
      { key: "combustible", label: "Combustible", type: "text" },
    ],
    confirmButtonText: () => "Confirmar",
    confirmDialogTitle: () => "Confirmar cambios",
    confirmDialogMessage: () =>
      "¿Estás seguro de que quieres guardar los cambios en la ficha técnica?",
  },
};

type Props = {
  entityType: EntityType;
  entityId?: string;
  data?: any;
  onDataChange?: (data: any) => void;
  isActive?: boolean;
  showActions?: boolean;
  className?: string;
};

export default function EntityForm({
  entityType,
  entityId: propEntityId,
  data: propData,
  onDataChange,
  isActive = true,
  showActions = true,
  className = "",
}: Props) {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams<{ id: string }>();

  const entityId = propEntityId || paramId || searchParams.get("id");
  const isEditMode = Boolean(entityId);

  const [formData, setFormData] = useState<any>(propData || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  const config = ENTITY_CONFIGS[entityType];

  const getDefaultData = () => {
    switch (entityType) {
      case "user":
        return {
          firstName: "",
          lastName: "",
          email: "",
          dni: "",
        };
      case "vehicle":
        return {
          id: "",
          licensePlate: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          imgUrl: "",
        };
      case "technical":
        return {
          nroChasis: "1HGCM82633A123456",
          nroMotor: "K20A123456",
          tipo: "Sedán",
          transmicion: "",
          combustible: "",
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (propData) {
        setFormData(propData);
        setLoading(false);
        return;
      }

      if (!entityId) {
        const defaultData = getDefaultData();
        setFormData(defaultData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let response;

        switch (entityType) {
          case "user":
            response = await getUserById(entityId);
            break;
          case "vehicle":
            response = await getVehicleById(entityId);
            break;
          case "technical":
            const technicalData = getDefaultData();
            setFormData(technicalData);
            setLoading(false);
            return;
          default:
            throw new Error(`Tipo de entidad no soportado: ${entityType}`);
        }

        if (response?.success) {
          setFormData(response.data);
        } else {
          setError(response?.message || `Error al cargar ${entityType}`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : `Error al cargar ${entityType}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityId, entityType, propData]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleConfirmClick = () => {
    setShowDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      setUpdating(true);

      switch (entityType) {
        case "vehicle":
          if (entityId) {
            const response = await updateVehicle(entityId, {
              licensePlate: formData.licensePlate,
              brand: formData.brand,
              model: formData.model,
              year: formData.year,
            });

            if (response.success) {
              setShowDialog(false);
              showSuccess("Vehículo actualizado exitosamente");
            } else {
              const errorMessage =
                response.message || "Error al actualizar vehículo";
              setError(errorMessage);
              showError(errorMessage);
            }
          } else {
            setShowDialog(false);
            showSuccess(
              "Datos guardados. Completa todos los campos y presiona 'Registrar Vehículo'"
            );
          }
          break;

        case "technical":
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setShowDialog(false);
          break;

        case "user":
          setShowDialog(false);
          break;

        default:
          setShowDialog(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Error al actualizar ${entityType}`;
      setError(errorMessage);
      showError(errorMessage);
      setShowDialog(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return (
      <div className={`entity-form ${className}`}>
        <h1>Error</h1>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </div>
    );
  }

  const isFieldDisabled = (field: FormField) => {
    if (field.disabled) return true;
    if (entityType === "vehicle" && !isActive) return true;
    return false;
  };

  return (
    <div className={`entity-form ${className}`}>
      <div className="entity-form-header">
        <div className="entity-info">
          <div className="entity-title-container">
            <h2 className="entity-title">{config.title(isEditMode)}</h2>
          </div>

          {config.fields.map((field) => (
            <div key={field.key} className="entity-field">
              <p className="entity-label">{field.label}</p>
              <input
                type={field.type}
                className={field.className || ""}
                value={formData[field.key] || ""}
                onChange={(e) => {
                  const value =
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value;
                  handleFieldChange(field.key, value);
                }}
                readOnly={field.readOnly}
                disabled={isFieldDisabled(field)}
              />
            </div>
          ))}
        </div>
      </div>

      {showActions && !config.fields.every((f) => f.readOnly) && (
        <div className="entity-actions">
          <ConfirmButton
            text={
              updating ? "Guardando..." : config.confirmButtonText(isEditMode)
            }
            onClick={handleConfirmClick}
            disabled={updating}
            loading={updating}
          />
        </div>
      )}

      {showDialog && (
        <ConfirmDialog
          open={showDialog}
          title={config.confirmDialogTitle(isEditMode)}
          message={config.confirmDialogMessage(isEditMode)}
          onConfirm={handleConfirmSave}
          onCancel={handleCancel}
        />
      )}

      {}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </div>
  );
}
