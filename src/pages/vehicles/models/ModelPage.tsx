import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import Form from "../../../components/Form/Form";
import type { FormSection } from "../../../components/Form/Form";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { Table, type TableColumn } from "../../../components/Table/table";
import { TableSelector } from "../../../components/TableSelector";
import {
  getVehicleModelById,
  createVehicleModel,
  updateVehicleModel,
} from "../../../services/vehicleModels";
import { getVehicles } from "../../../services/vehicles";
import { getMaintenanceRequirements } from "../../../services/maintenaceRequirements";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { VehicleBrandEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import { VEHICLE_TYPES } from "../../../common/constants";
import type { VehicleModel } from "../../../types/vehicleModel";
import type { Vehicle, VehicleFilterParams } from "../../../types/vehicle";
import type {
  MaintenanceRequirement,
  MaintenanceRequirementFilterParams,
} from "../../../types/maintenanceRequirement";
import type { ApiFindOptions } from "../../../services/common";
import { Car, Wrench } from "lucide-react";

const vehicleColumns: TableColumn<Vehicle>[] = [
  {
    field: "licensePlate",
    headerName: "Patente",
    minWidth: 120,
  },
  {
    field: "model.brand.name",
    headerName: "Marca",
    minWidth: 150,
  },
  {
    field: "year",
    headerName: "Año",
    minWidth: 80,
  },
];

const maintenanceRequirementColumns: TableColumn<MaintenanceRequirement>[] = [
  {
    field: "maintenance.name",
    headerName: "Mantenimiento",
    minWidth: 200,
  },
  {
    field: "kilometersFrequency",
    headerName: "Frecuencia (Km)",
    minWidth: 130,
  },
  {
    field: "daysFrequency",
    headerName: "Frecuencia (Días)",
    minWidth: 130,
  },
];

export default function ModelPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<VehicleModel>>({});

  // Handler for initial data
  const handleInitialData = useCallback((data: Partial<VehicleModel>) => {
    setFormState(data);
  }, []);

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
    enableEdit,
    cancelEdit,
    cancelCreate,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState<Partial<VehicleModel>>({
    redirectOnSuccess: "/vehicles/models",
    startInViewMode: !isNew,
    scope: "model",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing model (new entities handled via onInitialData)
    if (!isNew && id) {
      loadModel(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadModel = async (modelId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleModelById(modelId);

      if (response.success && response.data) {
        setFormState(response.data);
        setOriginalData(response.data);
      } else {
        showError(response.message || "Error al cargar el modelo");
      }
    }, "Error al cargar el modelo");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles/models");
    } else {
      const original = cancelEdit<Partial<VehicleModel>>();
      if (original) {
        setFormState(original);
      }
    }
  };

  const handleSave = () => {
    if (!formState.name?.trim()) {
      showError("El nombre del modelo es obligatorio");
      return;
    }
    if (!formState.brand) {
      showError("Debe seleccionar una marca");
      return;
    }
    if (!formState.vehicleType?.trim()) {
      showError("Debe especificar el tipo de vehículo");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} este modelo?`,
      () =>
        isNew
          ? createVehicleModel({
              name: formState.name!.trim(),
              brandId: formState.brand!.id,
              vehicleType: formState.vehicleType!.trim(),
            })
          : updateVehicleModel(id!, {
              name: formState.name!.trim(),
              brandId: formState.brand!.id,
              vehicleType: formState.vehicleType!.trim(),
            }),
      `Modelo ${actionText}do exitosamente`,
      {
        isCreate: isNew,
        entityRoute: "/vehicles/models",
      },
    );
  };

  const getVehiclesByModel = async (
    findOptions?: ApiFindOptions<VehicleFilterParams>,
  ) => {
    const modelFilter: VehicleFilterParams = {
      ...findOptions?.filters,
      modelId: id!,
    };

    return getVehicles({ ...findOptions, filters: modelFilter });
  };

  const getMaintenanceRequirementsByModel = async (
    findOptions?: ApiFindOptions<MaintenanceRequirementFilterParams>,
  ) => {
    const modelFilter: MaintenanceRequirementFilterParams = {
      ...findOptions?.filters,
      modelId: id!,
    };

    return getMaintenanceRequirements({ ...findOptions, filters: modelFilter });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando modelo..." />;
  }

  const sections: FormSection[] = [
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleBrandEntitySearch
          entity={formState.brand || null}
          onEntityChange={(brand) =>
            setFormState((prev) => ({ ...prev, brand: brand || undefined }))
          }
          disabled={disabled}
          contextScope="model"
          getFormData={() => formState}
        />
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
          value: formState.name || "",
          onChange: (value) =>
            setFormState((prev) => ({ ...prev, name: value })),
          required: true,
          placeholder: "Ej: Corolla",
          disabled: false,
        },
        {
          type: "select",
          key: "vehicleType",
          label: "Tipo de Vehículo",
          value: formState.vehicleType || "",
          onChange: (value) =>
            setFormState((prev) => ({ ...prev, vehicleType: value })),
          required: true,
          placeholder: "Seleccione un tipo de vehículo",
          options: VEHICLE_TYPES.map((type) => ({ value: type, label: type })),
          disabled: false,
        },
      ],
    },
  ];

  return (
    <div className="container">
      <Form
        title={isNew ? "Nuevo Modelo" : "Editar Modelo"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          saving,
          entityName: "Modelo",
        }}
      />

      {!isNew && id && (
        <TableSelector
          tabs={[
            {
              id: "vehicles",
              label: "Vehículos",
              icon: Car,
              table: (
                <Table
                  getRows={getVehiclesByModel}
                  columns={vehicleColumns}
                  header={{
                    title: "Vehículos de este Modelo",
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
            {
              id: "maintenanceRequirements",
              label: "Mantenimientos Requeridos",
              icon: Wrench,
              table: (
                <Table
                  getRows={getMaintenanceRequirementsByModel}
                  columns={maintenanceRequirementColumns}
                  header={{
                    title: "Mantenimientos Requeridos de este Modelo",
                  }}
                  actionColumn={{
                    route: "/maintenance/requirements",
                  }}
                  search={{
                    enabled: true,
                    placeholder: "Buscar mantenimientos...",
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
