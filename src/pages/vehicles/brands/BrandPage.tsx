import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Form from "../../../components/Form/Form";
import type { FormSection, FormButton } from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { Table, type TableColumn } from "../../../components/Table/table";
import {
  getVehicleBrandById,
  createVehicleBrand,
  updateVehicleBrand,
} from "../../../services/vehicleBrands";
import { getVehicles } from "../../../services/vehicles";
import { getVehicleModels } from "../../../services/vehicleModels";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Vehicle, VehicleFilterParams } from "../../../types/vehicle";
import type {
  VehicleModel,
  VehicleModelFilterParams,
} from "../../../types/vehicleModel";
import type { ApiFindOptions } from "../../../services/common";

const vehicleColumns: TableColumn<Vehicle>[] = [
  {
    field: "licensePlate",
    headerName: "Patente",
    minWidth: 120,
  },
  {
    field: "model.name",
    headerName: "Modelo",
    minWidth: 150,
  },
  {
    field: "year",
    headerName: "Año",
    minWidth: 80,
  },
];

const modelColumns: TableColumn<VehicleModel>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 150,
  },
  {
    field: "vehicleType",
    headerName: "Tipo de Vehículo",
    minWidth: 150,
  },
];

export default function BrandPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: "",
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
  } = usePageState({ redirectOnSuccess: "/vehicles/brands" });

  useEffect(() => {
    if (!isNew && id) {
      loadBrand(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadBrand = async (brandId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleBrandById(brandId);

      if (response.success && response.data) {
        setFormData({
          name: response.data.name || "",
        });
      } else {
        showError(response.message || "Error al cargar la marca");
      }
    }, "Error al cargar la marca");
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showError("El nombre de la marca es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} esta marca?`,
      () =>
        isNew
          ? createVehicleBrand({
              name: formData.name.trim(),
            })
          : updateVehicleBrand(id!, {
              name: formData.name.trim(),
            }),
      `Marca ${actionText}da exitosamente`,
    );
  };

  const getVehiclesByBrand = async (
    findOptions?: ApiFindOptions<VehicleFilterParams>,
  ) => {
    const brandFilter: VehicleFilterParams = {
      ...findOptions?.filters,
      brandId: id!,
    };

    return getVehicles({ ...findOptions, filters: brandFilter });
  };

  const getModelsByBrand = async (
    findOptions?: ApiFindOptions<VehicleModelFilterParams>,
  ) => {
    const brandFilter: VehicleModelFilterParams = {
      ...findOptions?.filters,
      brandId: id!,
    };

    return getVehicleModels({ ...findOptions, filters: brandFilter });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando marca..." />;
  }

  const sections: FormSection[] = [
    {
      type: "fields",
      title: "Información de la Marca",
      layout: "vertical",
      fields: [
        {
          type: "text",
          key: "name",
          label: "Nombre",
          value: formData.name,
          onChange: (value) => setFormData({ ...formData, name: value }),
          required: true,
          placeholder: "Ej: Toyota",
          disabled: false,
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

  return (
    <div className="container">
      <Form
        title={isNew ? "Nueva Marca" : "Editar Marca"}
        sections={sections}
        buttons={buttons}
      />

      {!isNew && id && (
        <>
          <Table
            getRows={getModelsByBrand}
            columns={modelColumns}
            header={{
              title: "Modelos de esta Marca",
              addButton: {
                text: "+ Nuevo Modelo",
                onClick: () => navigate(`/vehicles/models/new?brandId=${id}`),
              },
            }}
            actionColumn={{
              route: "/vehicles/models",
            }}
            search={{
              enabled: true,
              placeholder: "Buscar modelos...",
            }}
          />

          <Table
            getRows={getVehiclesByBrand}
            columns={vehicleColumns}
            header={{
              title: "Vehículos de esta Marca",
            }}
            search={{
              enabled: true,
              placeholder: "Buscar vehículos...",
            }}
          />
        </>
      )}

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
