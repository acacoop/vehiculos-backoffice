import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { Table, type TableColumn } from "../../../components/Table";
import {
  getMaintenanceCategoryById,
  createMaintenanceCategory,
  updateMaintenanceCategory,
} from "../../../services/categories";
import { getMaintenances } from "../../../services/maintenances";
import { usePageState } from "../../../hooks";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import { Form } from "../../../components/Form";
import type { FormSection } from "../../../components/Form";
import type {
  Maintenance,
  MaintenanceFilterParams,
} from "../../../types/maintenance";
import type { Category } from "../../../types/category";
import type { ApiFindOptions } from "../../../services/common";

const maintenanceColumns: TableColumn<Maintenance>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 250,
  },
  {
    field: "kilometersFrequency",
    headerName: "Frecuencia (KM)",
    minWidth: 150,
    transform: (value) => (value ? `${value} km` : "N/A"),
  },
  {
    field: "daysFrequency",
    headerName: "Frecuencia (Días)",
    minWidth: 150,
    transform: (value) => (value ? `${value} días` : "N/A"),
  },
];

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const isNew = location.pathname.endsWith("/new");

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
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
  } = usePageState({
    redirectOnSuccess: "/maintenance/categories",
    startInViewMode: !isNew,
    scope: "category",
  });

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<Category>>({});

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    (async () => {
      await executeLoad(async () => {
        const response = await getMaintenanceCategoryById(id);

        if (cancelled) return;

        if (response.success && response.data) {
          setFormState(response.data);
          setOriginalData(response.data);
        } else {
          showError(response.message || "Error al cargar la categoría");
        }
      }, "Error al cargar la categoría");
    })();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const handleCancel = () => {
    if (isNew) {
      goTo("/maintenance/categories");
    } else {
      const original = cancelEdit<Partial<Category>>();
      if (original) {
        setFormState(original);
      }
    }
  };

  const handleSave = () => {
    if (!formState.name?.trim()) {
      showError("El nombre de la categoría es obligatorio");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";
    executeSave(
      `¿Está seguro que desea ${actionText} esta categoría?`,
      () =>
        isNew
          ? createMaintenanceCategory({
              name: formState.name!.trim(),
            })
          : updateMaintenanceCategory(id!, {
              name: formState.name!.trim(),
            }),
      `Categoría ${actionText}da exitosamente`,
    );
  };

  const getMaintenancesByCategory = async (
    findOptions?: ApiFindOptions<MaintenanceFilterParams>,
  ) => {
    const categoryFilter: MaintenanceFilterParams = {
      ...findOptions?.filters,
      categoryId: id!,
    };

    return getMaintenances({ ...findOptions, filters: categoryFilter });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando categoría..." />;
  }

  const sections: FormSection[] = [
    {
      type: "fields",
      title: "Información de la Categoría",
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
          placeholder: "Ej: Cambio de aceite",
        },
      ],
    },
  ];

  return (
    <div className="container">
      <Form
        title={isNew ? "Nueva Categoría" : "Editar Categoría"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          saving,
          entityName: "Categoría",
        }}
      />

      {!isNew && id && (
        <Table
          getRows={getMaintenancesByCategory}
          columns={maintenanceColumns}
          header={{
            title: "Mantenimientos de esta Categoría",
            addButton: {
              text: "+ Nuevo Mantenimiento",
              onClick: () =>
                goToWithData("/maintenance/items/new", { category: formState }),
            },
          }}
          actionColumn={{
            route: "/maintenance/items",
          }}
          search={{
            enabled: true,
            placeholder: "Buscar mantenimientos...",
          }}
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
