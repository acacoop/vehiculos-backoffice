import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import {
  Form,
  type FormSection,
  type FormButton,
} from "../../../components/Form";
import { usePageState } from "../../../hooks";
import {
  getMaintenanceChecklistById,
  createMaintenanceChecklist,
  updateMaintenanceChecklist,
  deleteMaintenanceChecklist,
} from "../../../services/maintenanceChecklists";
import { getVehicleById } from "../../../services/vehicles";
import type { MaintenanceChecklist } from "../../../types/maintenanceChecklist";
import type { MaintenanceChecklistItem } from "../../../types/maintenanceChecklistItem";
import type { Vehicle } from "../../../types/vehicle";
import { COLORS, QUARTER_LABELS } from "../../../common";
import { VehicleEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { getMaintenanceChecklistItems } from "../../../services/maintenanceChecklistItems";

export default function MaintenanceChecklistPage() {
  const { id } = useParams<{ id: string }>();

  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [checklist, setChecklist] = useState<MaintenanceChecklist | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    quarter: 1 as 1 | 2 | 3 | 4,
    intendedDeliveryDate: "",
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
  } = usePageState({ redirectOnSuccess: "/maintenance/checklists" });

  // Load vehicle from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const vehicleId = searchParams.get("vehicleId");

    if (vehicleId) {
      executeLoad(async () => {
        const response = await getVehicleById(vehicleId);
        if (response.success && response.data) {
          setVehicle(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  const loadData = useCallback(async () => {
    if (!id || isNew) return;

    await executeLoad(async () => {
      const checklistRes = await getMaintenanceChecklistById(id);

      if (checklistRes.success && checklistRes.data) {
        setChecklist(checklistRes.data);
        if (checklistRes.data.vehicle) {
          setVehicle(checklistRes.data.vehicle);
        }
        setFormData({
          year: checklistRes.data.year,
          quarter: checklistRes.data.quarter,
          intendedDeliveryDate: checklistRes.data.intendedDeliveryDate,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = () => {
    if (!vehicle) {
      showError("Debe seleccionar un vehículo");
      return;
    }

    if (!formData.intendedDeliveryDate) {
      showError("Debe seleccionar una fecha de entrega prevista");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} este checklist?`,
      () => {
        const payload = {
          vehicleId: vehicle.id,
          year: formData.year,
          quarter: formData.quarter,
          intendedDeliveryDate: formData.intendedDeliveryDate,
        };

        return isNew
          ? createMaintenanceChecklist(payload)
          : updateMaintenanceChecklist(id!, payload);
      },
      `Checklist ${actionText}do exitosamente`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar este checklist?",
      () => deleteMaintenanceChecklist(id),
      "Checklist eliminado exitosamente",
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (!isNew && !checklist) {
    return (
      <div>
        <div className="page-header">
          <h1>Checklist no encontrado</h1>
        </div>
      </div>
    );
  }

  const itemColumns: TableColumn<MaintenanceChecklistItem>[] = [
    {
      field: "title",
      headerName: "Descripción",
      flex: 2,
    },
    {
      field: "passed",
      headerName: "Estado",
      flex: 1,
      transform: (value: string | boolean) => {
        const passed = Boolean(value);
        if (passed) return "Aprobado";
        const currentDate = new Date();
        const intendedDate = new Date(
          isNew
            ? formData.intendedDeliveryDate
            : checklist!.intendedDeliveryDate,
        );
        if (currentDate > intendedDate) return "Retrasada";
        return "Rechazado";
      },
      color: (value: string | boolean) => {
        const passed = Boolean(value);
        if (passed) return COLORS.success;
        const currentDate = new Date();
        const intendedDate = new Date(
          isNew
            ? formData.intendedDeliveryDate
            : checklist!.intendedDeliveryDate,
        );
        if (currentDate > intendedDate) return COLORS.warning;
        return COLORS.error;
      },
    },
    {
      field: "observations",
      headerName: "Observaciones",
      flex: 2,
    },
  ];

  const itemActionColumn = {
    route: `/maintenance/checklists/items`,
    width: 100,
  };

  const checklistVehicle = checklist?.vehicle || vehicle;
  const vehicleLabel = checklistVehicle
    ? `${checklistVehicle.model?.brand?.name ?? ""} ${
        checklistVehicle.model?.name ?? ""
      } - ${checklistVehicle.licensePlate ?? ""}`.trim()
    : "N/A";

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <VehicleEntitySearch
          entity={vehicle}
          onEntityChange={setVehicle}
          disabled={!isNew}
        />
      ),
    },
    {
      title: "Información del Checklist",
      type: "fields",
      layout: "grid",
      columns: 2,
      fields: [
        {
          type: "number",
          value: formData.year,
          key: "year",
          label: "Año",
          onChange: (value: number) =>
            setFormData((prev) => ({ ...prev, year: value })),
          required: true,
        },
        {
          type: "select",
          value: formData.quarter.toString(),
          key: "quarter",
          label: "Trimestre",
          options: [
            { value: "1", label: "Q1" },
            { value: "2", label: "Q2" },
            { value: "3", label: "Q3" },
            { value: "4", label: "Q4" },
          ],
          onChange: (value: string) =>
            setFormData((prev) => ({
              ...prev,
              quarter: parseInt(value) as 1 | 2 | 3 | 4,
            })),
          required: true,
        },
        {
          type: "date",
          value: formData.intendedDeliveryDate,
          key: "intendedDeliveryDate",
          label: "Fecha de Entrega Prevista",
          onChange: (value: string) =>
            setFormData((prev) => ({
              ...prev,
              intendedDeliveryDate: value,
            })),
          required: true,
          span: 2,
        },
      ],
    },
    ...(!isNew
      ? [
          {
            title: "Estado del Checklist",
            type: "fields" as const,
            layout: "grid" as const,
            columns: 2,
            fields: [
              {
                type: "display" as const,
                value: checklist!.filledBy
                  ? `${checklist!.filledBy.firstName} ${
                      checklist!.filledBy.lastName
                    }`
                  : "No completado",
                key: "filledBy",
                label: "Completado por",
              },
              {
                type: "display" as const,
                value: checklist!.filledAt || "No completado",
                key: "filledAt",
                label: "Fecha de Completado",
              },
            ],
          },
        ]
      : []),
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/checklists"),
      disabled: saving,
    },
    ...(!isNew
      ? [
          {
            text: "Eliminar",
            variant: "danger" as const,
            onClick: handleDelete,
            disabled: saving,
          },
        ]
      : []),
    {
      text: saving
        ? isNew
          ? "Creando..."
          : "Guardando..."
        : isNew
        ? "Crear Checklist"
        : "Guardar Cambios",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  return (
    <div>
      <Form
        title={
          isNew
            ? "Nuevo Checklist de Mantenimiento"
            : `Checklist de Mantenimiento - ${vehicleLabel} ${formData.year} ${
                QUARTER_LABELS[formData.quarter]
              }`
        }
        sections={sections}
        buttons={buttons}
      />

      {!isNew && checklist && (
        <div style={{ marginTop: "2rem" }}>
          <Table
            columns={itemColumns}
            getRows={() =>
              getMaintenanceChecklistItems({
                filters: { maintenanceChecklistId: id },
              })
            }
            actionColumn={itemActionColumn}
            header={{
              title: "Items del Checklist",
            }}
          />
        </div>
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
