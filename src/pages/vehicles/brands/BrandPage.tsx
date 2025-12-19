import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Form from "../../../components/Form/Form";
import type { FormSection } from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { Table, type TableColumn } from "../../../components/Table";
import { TableSelector } from "../../../components/TableSelector";
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
import type { VehicleBrand } from "../../../types/vehicleBrand";
import type { ApiFindOptions } from "../../../services/common";
import { Layers, Car } from "lucide-react";

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
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [formState, setFormState] = useState<Partial<VehicleBrand>>({
    name: "",
  });

  const {
    loading,
    saving,
    isEditing,
    isDialogOpen,
    dialogMessage,
    notification,
    executeLoad,
    executeSave,
    showError,
    goTo,
    goToWithData,
    enableEdit,
    cancelEdit,
    cancelCreate,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({
    redirectOnSuccess: "/vehicles/brands",
    startInViewMode: !isNew,
    scope: "brand",
  });

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
        setFormState(response.data);
        setOriginalData(response.data);
      } else {
        showError(response.message || "Error al cargar la marca");
      }
    }, "Error al cargar la marca");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles/brands");
    } else {
      const original = cancelEdit<Partial<VehicleBrand>>();
      if (original) {
        setFormState(original);
      }
    }
  };

  const handleSave = () => {
    if (!formState.name?.trim()) {
      showError("El nombre de la marca es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} esta marca?`,
      () =>
        isNew
          ? createVehicleBrand({
              name: formState.name!.trim(),
            })
          : updateVehicleBrand(id!, {
              name: formState.name!.trim(),
            }),
      `Marca ${actionText}da exitosamente`,
      {
        isCreate: isNew,
        entityRoute: "/vehicles/brands",
      },
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
          value: formState.name || "",
          onChange: (value) =>
            setFormState((prev) => ({ ...prev, name: value })),
          required: true,
          placeholder: "Ej: Toyota",
          disabled: false,
        },
      ],
    },
  ];

  return (
    <div className="container">
      <Form
        title={isNew ? "Nueva Marca" : "Editar Marca"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          saving,
          entityName: "Marca",
        }}
      />

      {!isNew && id && (
        <TableSelector
          tabs={[
            {
              id: "models",
              label: "Modelos",
              icon: Layers,
              table: (
                <Table
                  getRows={getModelsByBrand}
                  columns={modelColumns}
                  header={{
                    title: "Modelos de esta Marca",
                    addButton: {
                      text: "+ Nuevo Modelo",
                      onClick: () =>
                        goToWithData("/vehicles/models/new", {
                          brand: formState,
                        }),
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
              ),
            },
            {
              id: "vehicles",
              label: "Vehículos",
              icon: Car,
              table: (
                <Table
                  getRows={getVehiclesByBrand}
                  columns={vehicleColumns}
                  header={{
                    title: "Vehículos de esta Marca",
                  }}
                  actionColumn={{
                    route: "/vehicles",
                  }}
                  search={{
                    enabled: true,
                    placeholder: "Buscar vehículos...",
                  }}
                />
              ),
            },
          ]}
        />
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
