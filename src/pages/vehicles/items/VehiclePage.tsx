import { useParams } from "react-router-dom";
import { Form } from "../../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../../hooks";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "../../../services/vehicles";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

const vehicleInfoSections = [
  {
    title: "Información General",
    fields: [
      {
        type: "text",
        key: "licensePlate",
        label: "Patente",
      },
      {
        type: "text",
        key: "model.brand.name",
        label: "Marca",
      },
      {
        type: "text",
        key: "year",
        label: "Año",
      },
    ],
  },
  {
    title: "Ficha Técnica",
    fields: [
      {
        type: "text",
        key: "chassisNumber",
        label: "Número de Chasis",
      },
      {
        type: "text",
        key: "engineNumber",
        label: "Número de Motor",
      },
      {
        type: "text",
        key: "transmission",
        label: "Transmisión",
      },
      {
        type: "text",
        key: "fuelType",
        label: "Tipo de Combustible",
      },
    ],
  },
];

export default function VehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    licensePlate: "",
    brandId: "",
    modelId: "",
    year: new Date().getFullYear(),
    chassisNumber: "",
    engineNumber: "",
    transmission: "",
    fuelType: "",
  });

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
  } = usePageState({ redirectOnSuccess: "/vehicles" });

  useEffect(() => {
    if (!isNew && id) {
      loadVehicle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadVehicle = async (vehicleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleById(vehicleId);

      if (response.success && response.data) {
        setFormData({
          licensePlate: response.data.licensePlate || "",
          brandId: response.data.model.brand.id || "",
          modelId: response.data.model.id || "",
          year: response.data.year || new Date().getFullYear(),
          chassisNumber: response.data.chassisNumber || "",
          engineNumber: response.data.engineNumber || "",
          transmission: response.data.transmission || "",
          fuelType: response.data.fuelType || "",
        });
      } else {
        showError(response.message || "Error al cargar el vehículo");
      }
    }, "Error al cargar el vehículo");
  };

  const handleSave = () => {
    if (!formData.licensePlate) {
      showError("La patente es obligatoria");
      return;
    }

    if (!formData.modelId) {
      showError("El modelo es obligatorio");
      return;
    }

    if (!formData.year) {
      showError("El año es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} este vehículo?`,
      () =>
        isNew
          ? createVehicle({
              licensePlate: formData.licensePlate,
              modelId: formData.modelId,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
            })
          : updateVehicle(id!, {
              licensePlate: formData.licensePlate,
              modelId: formData.modelId,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
              fuelType: formData.fuelType || undefined,
            }),
      `Vehículo ${actionText}do con éxito`
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando vehículo..." />;
  }

  return (
    <div>
      <div>
        <Form
          title="Detalle del Vehículo"
          sections={vehicleInfoSections}
          mode="relaxed"
        />
      </div>
    </div>
  );
}
