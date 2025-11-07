import { useParams } from "react-router-dom";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../../hooks";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "../../../services/vehicles";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { VehicleModelEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import type { VehicleBrand } from "../../../types/vehicleBrand";
import type { VehicleModel } from "../../../types/vehicleModel";

export default function VehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [model, setModel] = useState<VehicleModel | null>(null);

  const [formData, setFormData] = useState({
    licensePlate: "",
    year: new Date().getFullYear(),
    chassisNumber: "",
    engineNumber: "",
    transmission: "",
    fuelType: "",
  });

  const { loading, saving, executeLoad, executeSave, showError, goTo } =
    usePageState({ redirectOnSuccess: "/vehicles" });

  useEffect(() => {
    if (!isNew && id) {
      loadVehicle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Clear model when brand changes (unless loading a vehicle)
  useEffect(() => {
    if (brand && model && model.brand?.id !== brand.id) {
      setModel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  const loadVehicle = async (vehicleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleById(vehicleId);

      if (response.success && response.data) {
        setFormData({
          licensePlate: response.data.licensePlate || "",
          year: response.data.year || new Date().getFullYear(),
          chassisNumber: response.data.chassisNumber || "",
          engineNumber: response.data.engineNumber || "",
          transmission: response.data.transmission || "",
          fuelType: response.data.fuelType || "",
        });

        // Set brand and model from the loaded vehicle
        if (response.data.model) {
          setModel(response.data.model);
          if (response.data.model.brand) {
            setBrand(response.data.model.brand);
          }
        }
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

    if (!model) {
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
              modelId: model!.id,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
            })
          : updateVehicle(id!, {
              licensePlate: formData.licensePlate,
              modelId: model!.id,
              year: formData.year,
              chassisNumber: formData.chassisNumber || undefined,
              engineNumber: formData.engineNumber || undefined,
              transmission: formData.transmission || undefined,
              fuelType: formData.fuelType || undefined,
            }),
      `Vehículo ${actionText}do con éxito`
    );
  };

  const vehicleInfoSections: FormSection[] = [
    {
      type: "fields",
      title: "Información General",
      fields: [
        {
          type: "text",
          value: formData.licensePlate,
          onChange: (value: string) =>
            setFormData({ ...formData, licensePlate: value }),
          key: "licensePlate",
          label: "Patente",
          required: true,
        },
        {
          type: "number",
          value: formData.year,
          onChange: (value: number) =>
            setFormData({ ...formData, year: value }),
          key: "year",
          label: "Año",
          required: true,
        },
      ],
    },
    {
      type: "entity",
      render: (
        <VehicleModelEntitySearch model={model} onModelChange={setModel} />
      ),
    },
    {
      type: "fields",
      title: "Ficha Técnica",
      fields: [
        {
          type: "text",
          value: formData.chassisNumber,
          onChange: (value: string) =>
            setFormData({ ...formData, chassisNumber: value }),
          key: "chassisNumber",
          label: "Número de Chasis",
        },
        {
          type: "text",
          value: formData.engineNumber,
          onChange: (value: string) =>
            setFormData({ ...formData, engineNumber: value }),
          key: "engineNumber",
          label: "Número de Motor",
        },
        {
          type: "text",
          value: formData.transmission,
          onChange: (value: string) =>
            setFormData({ ...formData, transmission: value }),
          key: "transmission",
          label: "Transmisión",
        },
        {
          type: "text",
          value: formData.fuelType,
          onChange: (value: string) =>
            setFormData({ ...formData, fuelType: value }),
          key: "fuelType",
          label: "Tipo de Combustible",
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/vehicles/brands"),
      disabled: saving,
    },
    {
      text: saving
        ? "Guardando..."
        : isNew
        ? "Crear Marca"
        : "Actualizar Marca",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando vehículo..." />;
  }

  return (
    <div>
      <div>
        <Form
          title="Detalle del Vehículo"
          sections={vehicleInfoSections}
          buttons={buttons}
        />
      </div>
    </div>
  );
}
