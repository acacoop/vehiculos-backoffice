import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import {
  Form,
  type FormSection,
  type FormButton,
} from "../../../components/Form";
import { usePageState } from "../../../hooks";
import {
  getMaintenanceChecklistItemById,
  updateMaintenanceChecklistItem,
  deleteMaintenanceChecklistItem,
} from "../../../services/maintenanceChecklistItems";
import { getMaintenanceChecklistById } from "../../../services/maintenanceChecklists";
import { MaintenanceChecklistEntitySearch } from "../../../components/EntitySearch/EntitySearch";
import type { MaintenanceChecklist } from "../../../types/maintenanceChecklist";
import {
  BACKEND_CHECKLIST_ITEM_STATUS,
  BACKEND_TO_UI_STATUS,
  type BackendChecklistItemStatus,
} from "../../../common";
import type { MaintenanceChecklistItem } from "../../../types/maintenanceChecklistItem";

export default function MaintenanceChecklistItemPage() {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<MaintenanceChecklistItem | null>(null);
  const [checklist, setChecklist] = useState<MaintenanceChecklist | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    status:
      BACKEND_CHECKLIST_ITEM_STATUS.PENDIENTE as BackendChecklistItemStatus,
    observations: "",
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
  } = usePageState({
    redirectOnSuccess: checklist
      ? `/maintenance/checklists/${checklist.id}`
      : "/maintenance/checklists",
  });

  const loadData = async () => {
    if (!id) return;

    await executeLoad(async () => {
      const res = await getMaintenanceChecklistItemById(id);
      if (res.success && res.data) {
        setItem(res.data);
        setFormData({
          category: res.data.category,
          title: res.data.title,
          status: res.data.status,
          observations: res.data.observations,
        });

        // Fetch the associated checklist
        const checklistRes = await getMaintenanceChecklistById(
          res.data.maintenanceChecklistId,
        );
        if (checklistRes.success && checklistRes.data) {
          setChecklist(checklistRes.data);
        }
      }
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validateForm = () => {
    if (!checklist) {
      showError("Debe seleccionar un checklist");
      return false;
    }
    if (!formData.title.trim()) {
      showError("El título es obligatorio");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !id || !item || !checklist) return;

    const payload = {
      maintenanceChecklistId: checklist.id,
      category: formData.category,
      title: formData.title,
      status: formData.status,
      observations: formData.observations,
    };

    executeSave(
      "¿Está seguro que desea actualizar este item del checklist?",
      () => updateMaintenanceChecklistItem(id, payload),
      "Item actualizado con éxito",
    );
  };

  const handleDelete = () => {
    if (!id) return;

    executeSave(
      "¿Está seguro que desea eliminar este item del checklist?",
      () => deleteMaintenanceChecklistItem(id),
      "Item eliminado con éxito",
    );
  };

  const sections: FormSection[] = [
    {
      type: "entity",
      render: (
        <MaintenanceChecklistEntitySearch
          entity={checklist}
          onEntityChange={(c: MaintenanceChecklist | null) => setChecklist(c)}
          disabled={true}
        />
      ),
    },
    {
      title: "Información del Item",
      type: "fields",
      layout: "vertical",
      fields: [
        {
          type: "text",
          value: formData.category,
          onChange: (value: string) =>
            setFormData({ ...formData, category: value }),
          key: "category",
          label: "Categoría",
          required: true,
        },
        {
          type: "text",
          value: formData.title,
          onChange: (value: string) =>
            setFormData({ ...formData, title: value }),
          key: "title",
          label: "Descripción",
          required: true,
        },
        {
          type: "select",
          value: formData.status,
          onChange: (value: string) =>
            setFormData({
              ...formData,
              status: value as BackendChecklistItemStatus,
            }),
          key: "status",
          label: "Estado",
          required: true,
          options: Object.values(BACKEND_CHECKLIST_ITEM_STATUS).map(
            (backendKey) => ({
              value: backendKey,
              label:
                BACKEND_TO_UI_STATUS[backendKey as BackendChecklistItemStatus],
            }),
          ),
        },
        {
          type: "textarea",
          value: formData.observations,
          onChange: (value: string) =>
            setFormData({ ...formData, observations: value }),
          key: "observations",
          label: "Observaciones",
          rows: 4,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () =>
        goTo(
          checklist
            ? `/maintenance/checklists/${checklist.id}`
            : "/maintenance/checklists",
        ),
      disabled: saving,
    },
    {
      text: "Eliminar",
      variant: "danger",
      onClick: handleDelete,
      disabled: saving,
    },
    {
      text: saving ? "Guardando..." : "Actualizar Item",
      variant: "primary",
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando item..." />;
  }

  return (
    <div>
      <Form
        title="Editar Item del Checklist de Mantenimiento"
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
