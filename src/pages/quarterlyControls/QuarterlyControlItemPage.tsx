import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import { Form, type FormSection } from "../../components/Form";
import { usePageState } from "../../hooks";
import {
  getQuarterlyControlItemById,
  updateQuarterlyControlItem,
  deleteQuarterlyControlItem,
} from "../../services/quarterlyControlItems";
import { getQuarterlyControlById } from "../../services/quarterlyControls";
import { QuarterlyControlEntitySearch } from "../../components/EntitySearch/EntitySearch";
import type { QuarterlyControl } from "../../types/quarterlyControl";
import {
  BACKEND_QUARTERLY_CONTROL_ITEM_STATUS,
  BACKEND_TO_UI_QUARTERLY_CONTROL_STATUS,
  type BackendQuarterlyControlItemStatus,
} from "../../common";
import type { QuarterlyControlItem } from "../../types/quarterlyControlItem";

export default function QuarterlyControlItemPage() {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<QuarterlyControlItem | null>(null);
  const [control, setControl] = useState<QuarterlyControl | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    status:
      BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.PENDIENTE as BackendQuarterlyControlItemStatus,
    observations: "",
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
    redirectOnSuccess: control
      ? `/quarterly-controls/${control.id}`
      : "/quarterly-controls",
    startInViewMode: true,
  });

  const loadData = async () => {
    if (!id) return;

    await executeLoad(async () => {
      const res = await getQuarterlyControlItemById(id);
      if (res.success && res.data) {
        setItem(res.data);
        const loadedFormData = {
          category: res.data.category,
          title: res.data.title,
          status: res.data.status,
          observations: res.data.observations,
        };
        setFormData(loadedFormData);

        // Fetch the associated control
        const controlRes = await getQuarterlyControlById(
          res.data.quarterlyControlId,
        );
        if (controlRes.success && controlRes.data) {
          setControl(controlRes.data);
        }

        setOriginalData({
          formData: loadedFormData,
          control: controlRes.success ? controlRes.data : null,
        });
      }
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    const original = cancelEdit<{
      formData: typeof formData;
      control: QuarterlyControl | null;
    }>();
    if (original) {
      setFormData(original.formData);
      setControl(original.control);
    } else {
      goTo(
        control ? `/quarterly-controls/${control.id}` : "/quarterly-controls",
      );
    }
  };

  const validateForm = () => {
    if (!control) {
      showError("Debe seleccionar un control trimestral");
      return false;
    }
    if (!formData.title.trim()) {
      showError("El título es obligatorio");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !id || !item || !control) return;

    const payload = {
      quarterlyControlId: control.id,
      category: formData.category,
      title: formData.title,
      status: formData.status,
      observations: formData.observations,
    };

    executeSave(
      "¿Está seguro que desea actualizar este item del control trimestral?",
      () => updateQuarterlyControlItem(id, payload),
      "Item actualizado con éxito",
    );
  };

  const handleDelete = () => {
    if (!id) return;

    executeSave(
      "¿Está seguro que desea eliminar este item del control trimestral?",
      () => deleteQuarterlyControlItem(id),
      "Item eliminado con éxito",
    );
  };

  const sections: FormSection[] = [
    {
      type: "entity",
      render: () => (
        <QuarterlyControlEntitySearch
          entity={control}
          onEntityChange={(c: QuarterlyControl | null) => setControl(c)}
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
              status: value as BackendQuarterlyControlItemStatus,
            }),
          key: "status",
          label: "Estado",
          required: true,
          options: Object.values(BACKEND_QUARTERLY_CONTROL_ITEM_STATUS).map(
            (backendKey) => ({
              value: backendKey,
              label:
                BACKEND_TO_UI_QUARTERLY_CONTROL_STATUS[
                  backendKey as BackendQuarterlyControlItemStatus
                ],
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

  if (loading) {
    return <LoadingSpinner message="Cargando item..." />;
  }

  return (
    <div>
      <Form
        title="Editar Item del Control Trimestral"
        sections={sections}
        modeConfig={{
          isNew: false,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: handleDelete,
          saving,
          entityName: "Item",
        }}
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
