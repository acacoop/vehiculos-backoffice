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
import type { MaintenanceChecklistItem } from "../../../types/maintenanceChecklistItem";
import type { MaintenanceChecklist } from "../../../types/maintenanceChecklist";

export default function MaintenanceChecklistItemPage() {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<MaintenanceChecklistItem | null>(null);
  const [checklist, setChecklist] = useState<MaintenanceChecklist | null>(null);

  const [formData, setFormData] = useState({
    passed: false,
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
  } = usePageState({ redirectOnSuccess: "/maintenance/checklists" });

  const loadData = async () => {
    if (!id) return;

    await executeLoad(async () => {
      const res = await getMaintenanceChecklistItemById(id);
      if (res.success && res.data) {
        setItem(res.data);
        setFormData({
          passed: res.data.passed,
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
    if (!formData.observations.trim()) {
      showError("Las observaciones son obligatorias");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !id || !item || !checklist) return;

    const payload = {
      maintenanceChecklistId: checklist.id,
      passed: formData.passed,
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
      title: "Información del Item",
      type: "fields",
      layout: "vertical",
      fields: [
        {
          type: "select",
          value: formData.passed.toString(),
          onChange: (value: string) =>
            setFormData({ ...formData, passed: value === "true" }),
          key: "passed",
          label: "Estado",
          required: true,
          options: [
            { value: "true", label: "Aprobado" },
            { value: "false", label: "Rechazado" },
          ],
        },
        {
          type: "textarea",
          value: formData.observations,
          onChange: (value: string) =>
            setFormData({ ...formData, observations: value }),
          key: "observations",
          label: "Observaciones",
          required: true,
          rows: 4,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/maintenance/checklists"),
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
      <MaintenanceChecklistEntitySearch
        entity={checklist}
        onEntityChange={setChecklist}
      />
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
