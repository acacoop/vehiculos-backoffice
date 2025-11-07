import { useParams, useLocation } from "react-router-dom";
import {
  Form,
  type FormButton,
  type FormSection,
} from "../../../components/Form";
import { useEffect, useState } from "react";
import { usePageState } from "../../../hooks";
import {
  createVehicleResponsible,
  getVehicleResponsibleById,
  updateVehicleResponsible,
  deleteVehicleResponsible,
} from "../../../services/vehicleResponsibles";
import { getVehicleById } from "../../../services/vehicles";
import { getUserById } from "../../../services/users";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import {
  VehicleEntitySearch,
  UserEntitySearch,
} from "../../../components/EntitySearch/EntitySearch";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../../components/NotificationToast/NotificationToast";
import type { Vehicle } from "../../../types/vehicle";
import type { User } from "../../../types/user";

export default function ResponsiblePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isIndefinite: true,
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
  } = usePageState({ redirectOnSuccess: "/vehicles/responsibles" });

  useEffect(() => {
    if (!isNew && id) {
      loadResponsible(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // Load vehicle from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const vehicleId = searchParams.get("vehicleId");

    console.log("Loading vehicle from query param:", {
      isNew,
      locationSearch: location.search,
      vehicleId,
    });

    if (vehicleId) {
      executeLoad(async () => {
        const response = await getVehicleById(vehicleId);
        console.log("Vehicle response:", response);
        if (response.success && response.data) {
          setVehicle(response.data);
        } else {
          console.error("Failed to load vehicle:", response.message);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  // Load user from query parameter
  useEffect(() => {
    if (!isNew) return;

    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");

    console.log("Loading user from query param:", {
      isNew,
      locationSearch: location.search,
      userId,
    });

    if (userId) {
      executeLoad(async () => {
        const response = await getUserById(userId);
        console.log("User response:", response);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          console.error("Failed to load user:", response.message);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, location.search]);

  const loadResponsible = async (responsibleId: string) => {
    await executeLoad(async () => {
      const response = await getVehicleResponsibleById(responsibleId);

      if (response.success && response.data) {
        const responsible = response.data;

        setFormData({
          startDate: responsible.startDate
            ? String(responsible.startDate).split("T")[0]
            : "",
          endDate: responsible.endDate
            ? String(responsible.endDate).split("T")[0]
            : "",
          isIndefinite: !responsible.endDate,
        });

        if (responsible.vehicle) {
          setVehicle(responsible.vehicle);
        }
        if (responsible.user) {
          setUser(responsible.user);
        }
      } else {
        showError(
          response.message || "Error al cargar el responsable de vehículo",
        );
      }
    }, "Error al cargar el responsable de vehículo");
  };

  const handleSave = () => {
    if (!formData.startDate) {
      showError("La fecha de inicio es obligatoria");
      return;
    }

    if (!user) {
      showError("El usuario es obligatorio");
      return;
    }

    if (!vehicle) {
      showError("El vehículo es obligatorio");
      return;
    }

    if (!formData.isIndefinite && !formData.endDate) {
      showError("La fecha de fin es obligatoria si no es indefinida");
      return;
    }

    const actionText = isNew ? "crear" : "actualizar";

    executeSave(
      `¿Está seguro que desea ${actionText} este responsable de vehículo?`,
      () =>
        isNew
          ? createVehicleResponsible({
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: new Date(
                formData.startDate + "T00:00:00.000Z",
              ).toISOString(),
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : new Date(formData.endDate + "T23:59:59.000Z").toISOString(),
            })
          : updateVehicleResponsible(id!, {
              userId: user!.id,
              vehicleId: vehicle!.id,
              startDate: new Date(
                formData.startDate + "T00:00:00.000Z",
              ).toISOString(),
              endDate:
                formData.isIndefinite || !formData.endDate
                  ? null
                  : new Date(formData.endDate + "T23:59:59.000Z").toISOString(),
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

  const sections: FormSection[] = [
    {
      type: "entity",
      render: <UserEntitySearch user={user} onUserChange={setUser} />,
    },
    {
      type: "entity",
      render: (
        <VehicleEntitySearch vehicle={vehicle} onVehicleChange={setVehicle} />
      ),
    },
    {
      type: "fields",
      title: "Período",
      fields: [
        {
          type: "date",
          value: formData.startDate,
          onChange: (value: string) =>
            setFormData({ ...formData, startDate: value }),
          key: "startDate",
          label: "Fecha Desde",
          required: true,
        },
        {
          type: "checkbox",
          value: formData.isIndefinite,
          onChange: (value: boolean) =>
            setFormData({ ...formData, isIndefinite: value }),
          key: "isIndefinite",
          label: "Asignación indefinida (sin fecha de fin)",
        },
        {
          type: "date",
          value: formData.endDate,
          onChange: (value: string) =>
            setFormData({ ...formData, endDate: value }),
          key: "endDate",
          label: "Fecha Hasta",
          show: !formData.isIndefinite,
          min: formData.startDate,
        },
      ],
    },
  ];

  const buttons: FormButton[] = [
    {
      text: "Cancelar",
      variant: "secondary",
      onClick: () => goTo("/vehicles/responsibles"),
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
        ? "Guardando..."
        : isNew
        ? "Crear Responsable"
        : "Actualizar Responsable",
      variant: "primary" as const,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando responsable..." />;
  }

  return (
    <div>
      <Form
        title={isNew ? "Nuevo Responsable" : "Editar Responsable"}
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
