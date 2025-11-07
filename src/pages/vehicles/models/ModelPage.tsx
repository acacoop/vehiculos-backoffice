import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Form from "../../../components/Form/Form";
import type { FormSection, FormButton } from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import {
  getVehicleModelById,
  createVehicleModel,
  updateVehicleModel,
} from "../../../services/vehicleModels";
import { getVehicleBrandById } from "../../../services/vehicleBrands";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { VehicleBrand } from "../../../types/vehicleBrand";
import { VehicleBrandEntitySearch } from "../../../components/EntitySearch/EntitySearch";

export default function ModelPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
  });
  const [brand, setBrand] = useState<VehicleBrand | null>(null);

  const {
    loading,
    saving,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({ redirectOnSuccess: "/vehicles/models" });

  useEffect(() => {
    if (!isNew && id) {
      loadModel(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load brand from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const brandId = searchParams.get("brandId");

    if (brandId) {
      executeLoad(async () => {
        const response = await getVehicleBrandById(brandId);
        if (response.success && response.data) {
          setBrand(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  const loadModel = async (modelId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleModelById(modelId);

      if (response.success && response.data) {
        setFormData({
          name: response.data.name || "",
          vehicleType: response.data.vehicleType || "",
        });
      } else {
        showError(response.message || "Error al cargar el modelo");
      }
    }, "Error al cargar el modelo");
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showError("El nombre del modelo es obligatorio");
      return;
    }
    if (!brand) {
      showError("Debe seleccionar una marca");
      return;
    }
    if (!formData.vehicleType.trim()) {
      showError("Debe especificar el tipo de vehículo");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este modelo?`,
      () =>
        isNew
          ? createVehicleModel({
              name: formData.name.trim(),
              brandId: brand.id,
              vehicleType: formData.vehicleType.trim(),
            })
          : updateVehicleModel(id!, {
              name: formData.name.trim(),
              brandId: brand.id,
              vehicleType: formData.vehicleType.trim(),
            }),
      `Modelo ${actionText}do exitosamente`,
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando modelo..." />;
  }

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <VehicleBrandEntitySearch brand={brand} onBrandChange={setBrand} />
      ),
    },
    {
      type: "fields",
      title: "Información del Modelo",
      layout: "vertical",
      fields: [
        {
          type: "text",
          key: "name",
          label: "Nombre",
          value: formData.name,
          onChange: (value) => setFormData({ ...formData, name: value }),
          required: true,
          placeholder: "Ej: Corolla",
          disabled: false,
        },
        {
          type: "text",
          key: "vehicleType",
          label: "Tipo de Vehículo",
          value: formData.vehicleType,
          onChange: (value) => setFormData({ ...formData, vehicleType: value }),
          required: true,
          placeholder: "Ej: Sedan, SUV, Pickup",
          disabled: false,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/vehicles/models"),
      disabled: saving,
    },
    {
      text: saving
        ? "Guardando..."
        : isNew
        ? "Crear Modelo"
        : "Actualizar Modelo",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  return (
    <div className="container">
      <Form
        title={isNew ? "Nuevo Modelo" : "Editar Modelo"}
        sections={sections}
        buttons={buttons}
      />

      <ConfirmDialog
        open={isDialogOpen}
        message={dialogMessage}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </div>
  );
}
