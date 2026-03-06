import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Table, type TableColumn } from "../../components/Table";
import { Form, type FormSection } from "../../components/Form";
import { usePageState } from "../../hooks";
import {
  getQuarterlyControlById,
  createQuarterlyControl,
  updateQuarterlyControl,
  deleteQuarterlyControl,
} from "../../services/quarterlyControls";
import type { QuarterlyControl } from "../../types/quarterlyControl";
import type { QuarterlyControlItem } from "../../types/quarterlyControlItem";
import {
  COLORS,
  BACKEND_TO_UI_QUARTERLY_CONTROL_STATUS,
  BACKEND_QUARTERLY_CONTROL_ITEM_STATUS,
} from "../../common";
import {
  VehicleEntitySearch,
  VehicleKilometersLogEntitySearch,
} from "../../components/EntitySearch/EntitySearch";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { getQuarterlyControlItems } from "../../services/quarterlyControlItems";

type QuarterlyControlFormData = Partial<QuarterlyControl> & {
  kilometers?: number;
};

export default function QuarterlyControlPage() {
  const { id } = useParams<{ id: string }>();

  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [control, setControl] = useState<QuarterlyControl | null>(null);
  const [formData, setFormData] = useState<QuarterlyControlFormData>({
    year: new Date().getFullYear(),
    quarter: 1,
    intendedDeliveryDate: "",
    kilometersLog: null,
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
    enableEdit,
    cancelEdit,
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({
    redirectOnSuccess: "/quarterly-controls",
    startInViewMode: !isNew,
  });

  const loadData = useCallback(async () => {
    if (!id || isNew) return;

    await executeLoad(async () => {
      const controlRes = await getQuarterlyControlById(id);

      if (controlRes.success && controlRes.data) {
        setControl(controlRes.data);
        const loadedFormData = {
          year: controlRes.data.year,
          quarter: controlRes.data.quarter,
          intendedDeliveryDate: controlRes.data.intendedDeliveryDate,
          vehicle: controlRes.data.vehicle || null,
          kilometersLog: controlRes.data.kilometersLog || null,
          kilometers: controlRes.data.kilometersLog?.kilometers,
        };
        setFormData(loadedFormData);
        setOriginalData(loadedFormData);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCancel = () => {
    if (isNew) {
      goTo("/quarterly-controls");
    } else {
      const original = cancelEdit<QuarterlyControlFormData>();
      if (original) {
        setFormData(original);
      }
    }
  };

  const handleSave = () => {
    if (!formData.vehicle) {
      showError("Debe seleccionar un vehículo");
      return;
    }

    if (!formData.intendedDeliveryDate) {
      showError("Debe seleccionar una fecha de entrega prevista");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} este control trimestral?`,
      () => {
        const payload = {
          vehicleId: formData.vehicle!.id,
          year: formData.year!,
          quarter: formData.quarter!,
          intendedDeliveryDate: formData.intendedDeliveryDate!,
          kilometers: formData.kilometers,
        };

        return isNew
          ? createQuarterlyControl(payload)
          : updateQuarterlyControl(id!, payload);
      },
      `Control trimestral ${actionText}do exitosamente`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar este control trimestral?",
      () => deleteQuarterlyControl(id),
      "Control trimestral eliminado exitosamente",
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (!isNew && !control) {
    return (
      <div>
        <div className="page-header">
          <h1>Control trimestral no encontrado</h1>
        </div>
      </div>
    );
  }

  const itemColumns: TableColumn<QuarterlyControlItem>[] = [
    {
      field: "category",
      headerName: "Categoría",
      flex: 1,
    },
    {
      field: "title",
      headerName: "Descripción",
      flex: 2,
    },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      type: "map",
      map: BACKEND_TO_UI_QUARTERLY_CONTROL_STATUS,
      color: (value: string) => {
        switch (value) {
          case BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.APROBADO:
            return COLORS.success;
          case BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.RECHAZADO:
            return COLORS.error;
          default:
            return COLORS.warning;
        }
      },
    },
    {
      field: "observations",
      headerName: "Observaciones",
      flex: 2,
    },
  ];

  const itemActionColumn = {
    route: `/quarterly-controls/items`,
    width: 100,
  };

  const sections: FormSection[] = [
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleEntitySearch
          entity={formData.vehicle || null}
          onEntityChange={(vehicle) =>
            setFormData((prev) => ({ ...prev, vehicle: vehicle || undefined }))
          }
          disabled={disabled || !isNew}
        />
      ),
    },
    {
      title: "Información del control trimestral",
      type: "fields",
      layout: "grid",
      columns: 2,
      fields: [
        {
          type: "number",
          value: formData.year!,
          key: "year",
          label: "Año",
          onChange: (value: number) =>
            setFormData((prev) => ({ ...prev, year: value })),
          required: true,
        },
        {
          type: "select",
          value: formData.quarter!.toString(),
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
          type: "datetime",
          value: formData.intendedDeliveryDate!,
          key: "intendedDeliveryDate",
          label: "Fecha de entrega prevista",
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
            title: "Estado del control",
            type: "fields" as const,
            layout: "grid" as const,
            columns: 2,
            fields: [
              {
                type: "display" as const,
                value: control!.filledBy
                  ? `${control!.filledBy.firstName} ${
                      control!.filledBy.lastName
                    }`
                  : "No completado",
                key: "filledBy",
                label: "Completado por",
              },
              {
                type: "display" as const,
                value: control!.filledAt || "No completado",
                key: "filledAt",
                label: "Fecha de completado",
              },
              ...(!isEditing && !formData.kilometersLog
                ? [
                    {
                      type: "display" as const,
                      value: "No registrado",
                      key: "kilometers",
                      label: "Kilómetros",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(isNew || isEditing
      ? [
          {
            title: "Kilómetros",
            type: "fields" as const,
            layout: "grid" as const,
            columns: 1,
            fields: [
              {
                type: "number" as const,
                value: formData.kilometers || 0,
                key: "kilometers",
                label: "Kilómetros",
                onChange: (value: number) =>
                  setFormData((prev) => ({ ...prev, kilometers: value })),
                required: false,
                min: 0,
              },
            ],
          },
        ]
      : []),
    ...(!isNew && !isEditing && formData.kilometersLog
      ? [
          {
            type: "entity" as const,
            render: ({ disabled }: { disabled: boolean }) => (
              <VehicleKilometersLogEntitySearch
                entity={formData.kilometersLog || null}
                onEntityChange={(kilometersLog) =>
                  setFormData((prev) => ({ ...prev, kilometersLog }))
                }
                disabled={disabled}
                enableCreate={false}
                enableNavigate={true}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Form
        title={isNew ? "Nuevo control trimestral" : "Editar control trimestral"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleDelete : undefined,
          saving,
          entityName: "Control",
        }}
      />

      {!isNew && control && (
        <div style={{ marginTop: "2rem" }}>
          <Table
            columns={itemColumns}
            getRows={(findOptions) =>
              getQuarterlyControlItems({
                ...findOptions,
                filters: {
                  ...findOptions.filters,
                  quarterlyControlId: control.id,
                },
              })
            }
            actionColumn={itemActionColumn}
            header={{
              title: "Ítems del control",
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
