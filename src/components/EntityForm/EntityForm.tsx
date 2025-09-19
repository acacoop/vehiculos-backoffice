import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import {
  getVehicleById,
  updateVehicle,
  createVehicle,
} from "../../services/vehicles";
import { getVehicleBrands } from "../../services/vehicleBrands";
import { getVehicleModels } from "../../services/vehicleModels";
import type { Vehicle } from "../../types/vehicle";
import { getUserById } from "../../services/users";
import {
  ConfirmDialog,
  NotificationToast,
  ConfirmButton,
  LoadingSpinner,
} from "../";
import { useNotification } from "../../hooks";
import "./EntityForm.css";

type FieldType = "text" | "email" | "number" | "select";

type FormField = {
  key: string;
  label: string;
  type: FieldType;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  options?: { label: string; value: string }[]; // for select
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
        key: "cuit",
        label: "CUIT",
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
    // brand/model converted to select placeholders dynamically (we'll inject options at render time)
    fields: [
      { key: "licensePlate", label: "Dominio", type: "text" },
      { key: "brandId", label: "Marca", type: "select" },
      { key: "modelId", label: "Modelo", type: "select" },
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
      { key: "chassisNumber", label: "Nro de Chasis", type: "text" },
      { key: "engineNumber", label: "Nro de Motor", type: "text" },
      {
        key: "vehicleType",
        label: "Tipo de Vehículo",
        type: "select",
        options: [
          { label: "", value: "" },
          { label: "Sedán", value: "Sedan" },
          { label: "Hatchback", value: "Hatchback" },
          { label: "SUV", value: "SUV" },
          { label: "Camioneta / Pick-up", value: "Pickup" },
          { label: "Van / Utilitario", value: "Van" },
          { label: "Moto", value: "Moto" },
          { label: "Camión", value: "Camion" },
          { label: "Bus / Colectivo", value: "Bus" },
          { label: "Otro", value: "Otro" },
        ],
      },
      {
        key: "transmission",
        label: "Transmisión",
        type: "select",
        options: [
          { label: "", value: "" },
          { label: "Manual", value: "Manual" },
          { label: "Automática", value: "Automatica" },
          { label: "CVT", value: "CVT" },
        ],
      },
      {
        key: "fuelType",
        label: "Combustible",
        type: "select",
        options: [
          { label: "", value: "" },
          { label: "Nafta", value: "Nafta" },
          { label: "Diésel", value: "Diesel" },
          { label: "GNC", value: "GNC" },
          { label: "Híbrido", value: "Hibrido" },
          { label: "Eléctrico", value: "Electrico" },
          { label: "Flex", value: "Flex" },
        ],
      },
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

  // Dynamic options for brand/model selects (declare early to keep hook order stable)
  const [brandOptions, setBrandOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [modelOptions, setModelOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const getDefaultData = () => {
    switch (entityType) {
      case "user":
        return {
          firstName: "",
          lastName: "",
          email: "",
          cuit: "",
        };
      case "vehicle":
        return {
          id: "",
          licensePlate: "",
          brandId: "",
          modelId: "",
          year: new Date().getFullYear(),
          imgUrl: "",
        };
      case "technical":
        return {
          chassisNumber: "",
          engineNumber: "",
          vehicleType: "",
          transmission: "",
          fuelType: "",
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
            response = await getVehicleById(entityId);
            break;
          default:
            throw new Error(`Tipo de entidad no soportado: ${entityType}`);
        }

        if (response?.success) {
          if (entityType === "technical") {
            const v = (response.data as Vehicle) || ({} as Vehicle);
            setFormData({
              chassisNumber: v.chassisNumber || "",
              engineNumber: v.engineNumber || "",
              vehicleType: v.vehicleType || "",
              transmission: v.transmission || "",
              fuelType: v.fuelType || "",
            });
          } else if (entityType === "vehicle") {
            const v = (response.data as Vehicle) || ({} as Vehicle);
            setFormData({
              id: v.id,
              licensePlate: v.licensePlate,
              brandId: v.modelObj?.brand.id || "",
              modelId: v.modelObj?.id || "",
              year: v.year,
            });
          } else {
            setFormData(response.data);
          }
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

  // Always declare effects in same order; internal guards prevent unnecessary work
  useEffect(() => {
    if (entityType !== "vehicle") return;
    (async () => {
      const brandsResp = await getVehicleBrands({ limit: 1000, page: 1 });
      if (brandsResp.success) {
        setBrandOptions([
          { label: "Seleccionar marca", value: "" },
          ...brandsResp.data.items.map((b) => ({ label: b.name, value: b.id })),
        ]);
      }
    })();
  }, [entityType]);

  useEffect(() => {
    if (entityType !== "vehicle") return;
    if (!formData.brandId) {
      setModelOptions([{ label: "Seleccionar modelo", value: "" }]);
      return;
    }
    (async () => {
      const modelsResp = await getVehicleModels({
        brandId: formData.brandId,
        limit: 1000,
        page: 1,
      });
      if (modelsResp.success) {
        setModelOptions([
          { label: "Seleccionar modelo", value: "" },
          ...modelsResp.data.items.map((m) => ({ label: m.name, value: m.id })),
        ]);
      }
    })();
  }, [entityType, formData.brandId]);

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
              year: formData.year,
              modelId: formData.modelId,
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
            // create flow
            const createResp = await createVehicle({
              licensePlate: formData.licensePlate,
              year: formData.year,
              modelId: formData.modelId,
              chassisNumber: formData.chassisNumber,
              engineNumber: formData.engineNumber,
              vehicleType: formData.vehicleType,
              transmission: formData.transmission,
              fuelType: formData.fuelType,
            });
            if (createResp.success) {
              setShowDialog(false);
              showSuccess("Vehículo creado exitosamente");
            } else {
              const msg = createResp.message || "Error al crear vehículo";
              setError(msg);
              showError(msg);
            }
          }
          break;

        case "technical":
          if (entityId) {
            const response = await updateVehicle(entityId, {
              chassisNumber: formData.chassisNumber,
              engineNumber: formData.engineNumber,
              vehicleType: formData.vehicleType,
              transmission: formData.transmission,
              fuelType: formData.fuelType,
            });

            if (response.success) {
              setShowDialog(false);
              showSuccess("Ficha técnica actualizada exitosamente");
            } else {
              const errorMessage =
                response.message || "Error al actualizar ficha técnica";
              setError(errorMessage);
              showError(errorMessage);
            }
          } else {
            // En modo creación no se persiste aquí
            setShowDialog(false);
          }
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
              {field.type === "select" ? (
                (() => {
                  let dynamicOptions = field.options || [];
                  if (entityType === "vehicle") {
                    if (field.key === "brandId") dynamicOptions = brandOptions;
                    if (field.key === "modelId") dynamicOptions = modelOptions;
                  }
                  const hasEmpty = dynamicOptions.some((o) => o.value === "");
                  return (
                    <select
                      className={`entity-select${
                        field.className ? ` ${field.className}` : ""
                      }`}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleFieldChange(field.key, val);
                        if (
                          entityType === "vehicle" &&
                          field.key === "brandId"
                        ) {
                          // reset model when brand changes
                          handleFieldChange("modelId", "");
                        }
                      }}
                      disabled={isFieldDisabled(field)}
                    >
                      {!hasEmpty && (
                        <option value="">Seleccionar una opción</option>
                      )}
                      {dynamicOptions.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="entity-option"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                })()
              ) : (
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
              )}
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
