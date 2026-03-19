import { useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { Form, type FormSection } from "../../../components/Form";
import { useEffect, useState, useCallback } from "react";
import { usePageState } from "../../../hooks";
import {
  createVehicleResponsible,
  getVehicleResponsibleById,
  updateVehicleResponsible,
  deleteVehicleResponsible,
} from "../../../services/vehicleResponsibles";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { VehicleResponsible } from "../../../types/vehicleResponsible";
import { toInputDateTimeSafe, inputDateTimeToAPI } from "../../../common/date";
import { ROUTES } from "../../../common";

export default function ResponsiblePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  // Main form state (entity data)
  const [formState, setFormState] = useState<Partial<VehicleResponsible>>({});

  // UI-only checkbox state
  const [isIndefinite, setIsIndefinite] = useState(true);

  // Handler for initial data
  const handleInitialData = useCallback((data: Partial<VehicleResponsible>) => {
    setFormState(data);
    setIsIndefinite(!data.endDate);
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
    setOriginalData,
    handleDialogConfirm,
    handleDialogCancel,
    closeNotification,
    cancelCreate,
  } = usePageState<Partial<VehicleResponsible>>({
    redirectOnSuccess: "/vehicles/responsibles",
    startInViewMode: !isNew,
    scope: "responsible",
    onInitialData: handleInitialData,
  });

  useEffect(() => {
    // Only load existing responsible (new entities handled via onInitialData)
    if (!isNew && id) {
      loadResponsible(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadResponsible = async (responsibleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleResponsibleById(responsibleId);

      if (response.success && response.data) {
        const responsible = response.data;
        setFormState(responsible);
        setIsIndefinite(!responsible.endDate);
        setOriginalData({
          formState: responsible,
          isIndefinite: !responsible.endDate,
        });
      } else {
        showError(
          response.message || "Error al cargar el responsable de vehículo",
        );
      }
    }, "Error al cargar el responsable de vehículo");
  };

  const handleCancel = () => {
    if (isNew) {
      if (cancelCreate()) return;
      goTo("/vehicles/responsibles");
    } else {
      const original = cancelEdit<{
        formState: Partial<VehicleResponsible>;
        isIndefinite: boolean;
      }>();
      if (original) {
        setFormState(original.formState);
        setIsIndefinite(original.isIndefinite);
      }
    }
  };

  const handleSave = () => {
    if (!formState.startDate) {
      showError("La fecha de inicio es obligatoria");
      return;
    }

    if (!formState.user) {
      showError("El usuario es obligatorio");
      return;
    }

    if (!formState.vehicle) {
      showError("El vehículo es obligatorio");
      return;
    }

    if (!formState.ceco) {
      showError("El CECO es obligatorio");
      return;
    }

    if (formState.ceco.length !== 8) {
      showError("El CECO debe tener exactamente 8 caracteres");
      return;
    }

    if (!isIndefinite && !formState.endDate) {
      showError("La fecha de fin es obligatoria si no es indefinida");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    const startDate = inputDateTimeToAPI(formState.startDate!);

    const endDate =
      isIndefinite || !formState.endDate
        ? null
        : inputDateTimeToAPI(formState.endDate);

    executeSave(
      `¿Está seguro que desea ${actionText} este responsable de vehículo?`,
      () =>
        isNew
          ? createVehicleResponsible({
              userId: formState.user!.id,
              vehicleId: formState.vehicle!.id,
              ceco: formState.ceco!,
              startDate,
              endDate,
            })
          : updateVehicleResponsible(id!, {
              userId: formState.user!.id,
              vehicleId: formState.vehicle!.id,
              ceco: formState.ceco!,
              startDate,
              endDate,
            }),
      `Responsable ${actionText}do con éxito`,
    );
  };

  const handleDelete = () => {
    if (!id || isNew) return;

    executeSave(
      "¿Está seguro que desea eliminar este responsable de vehículo?",
      () => deleteVehicleResponsible(id),
      "Responsable eliminado con éxito",
    );
  };

  const getFormData = () => ({ formState, isIndefinite });

  const sections: FormSection[] = [
    {
      type: "entity",
      render: ({ disabled }) => (
        <UserEntitySearch
          entity={formState.user || null}
          onEntityChange={(user) =>
            setFormState((prev) => ({ ...prev, user: user || undefined }))
          }
          disabled={disabled || !isNew}
        />
      ),
    },
    {
      type: "entity",
      render: ({ disabled }) => (
        <VehicleEntitySearch
          entity={formState.vehicle || null}
          onEntityChange={(vehicle) =>
            setFormState((prev) => ({ ...prev, vehicle: vehicle || undefined }))
          }
          disabled={disabled || !isNew}
          contextScope="responsible"
          getFormData={getFormData}
        />
      ),
    },
    {
      type: "fields",
      title: "CECO",
      layout: "grid",
      fields: [
        {
          type: "text",
          value: formState.ceco || "",
          onChange: (value: string) => {
            // Solo permitir números y máximo 8 caracteres
            const numericValue = value.replace(/\D/g, "").slice(0, 8);
            setFormState((prev) => ({ ...prev, ceco: numericValue }));
          },
          key: "ceco",
          label: "CECO (8 dígitos)",
          required: true,
          placeholder: "12345678",
        },
      ],
    },
    {
      type: "fields",
      title: "Período",
      layout: "grid",
      fields: [
        {
          type: "datetime",
          value: toInputDateTimeSafe(formState.startDate),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, startDate: value })),
          key: "startDate",
          label: "Fecha y hora desde",
          required: true,
        },
        {
          type: "datetime",
          value: toInputDateTimeSafe(formState.endDate),
          onChange: (value: string) =>
            setFormState((prev) => ({ ...prev, endDate: value })),
          key: "endDate",
          label: "Fecha y hora hasta",
          show: !isIndefinite,
          min: toInputDateTimeSafe(formState.startDate),
        },
        {
          type: "checkbox",
          value: isIndefinite,
          onChange: (value: boolean) => setIsIndefinite(value),
          key: "isIndefinite",
          label: "Asignación indefinida (sin fecha de fin)",
          span: 2,
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando responsable..." />;
  }

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: ROUTES.HOME },
          { label: "Responsables", href: ROUTES.RESPONSIBLES },
          { label: isNew ? "Nuevo responsable" : "Editar responsable" },
        ]}
        backButton={{
          text: "Volver",
          fallbackHref: ROUTES.RESPONSIBLES,
        }}
      />
      <Form
        title={isNew ? "Nuevo responsable" : "Editar responsable"}
        sections={sections}
        modeConfig={{
          isNew,
          isEditing,
          onSave: handleSave,
          onCancel: handleCancel,
          onEdit: enableEdit,
          onDelete: !isNew ? handleDelete : undefined,
          saving,
          entityName: "Responsable",
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
