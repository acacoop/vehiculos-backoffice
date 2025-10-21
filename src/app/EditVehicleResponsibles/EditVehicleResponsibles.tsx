import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getVehicleResponsibleById,
  createVehicleResponsible,
  updateVehicleResponsible,
  deleteVehicleResponsible,
} from "../../services/vehicleResponsibles";
import {
  useUserSearch,
  useVehicleSearch,
  useConfirmDialog,
  useNotification,
} from "../../hooks";
import { getVehicleById } from "../../services/vehicles";
import { getUserById } from "../../services/users";
import {
  FormLayout,
  ConfirmDialog,
  NotificationToast,
  LoadingSpinner,
} from "../../components";
import { FieldType, EntityType } from "../../components/FormLayout/FormLayout";
import type { Vehicle } from "../../types/vehicle";
import type { User } from "../../types/user";
import "./EditVehicleResponsibles.css";

export default function EditVehicleResponsibles() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode =
    location.pathname.includes("/edit-vehicle-responsibles") && !id;

  const userSearch = useUserSearch();
  const vehicleSearch = useVehicleSearch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preloadedVehicle, setPreloadedVehicle] = useState<Vehicle | null>(
    null
  );
  const [preloadedUser, setPreloadedUser] = useState<User | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false);

  const {
    isOpen: isConfirmOpen,
    message: confirmMessage,
    showConfirm,
    handleConfirm: confirmDialogConfirm,
    handleCancel: confirmDialogCancel,
  } = useConfirmDialog();
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isCreateMode) {
          // prefill vehicleId/userId from query params if present
          const search = new URLSearchParams(location.search);
          const vehicleIdFromQuery = search.get("vehicleId");
          const userIdFromQuery = search.get("userId");

          const today = new Date().toISOString().split("T")[0];
          setStartDate(today);

          if (vehicleIdFromQuery) {
            const vRes = await getVehicleById(vehicleIdFromQuery);
            if (vRes.success) setPreloadedVehicle(vRes.data);
          }
          if (userIdFromQuery) {
            const uRes = await getUserById(userIdFromQuery);
            if (uRes.success) setPreloadedUser(uRes.data);
          }

          setLoading(false);
          return;
        }

        if (!id) {
          setError("ID no proporcionado");
          setLoading(false);
          return;
        }

        const resp = await getVehicleResponsibleById(id);
        if (resp.success && resp.data) {
          const vr = resp.data as any;
          if (vr.vehicle) setPreloadedVehicle(vr.vehicle as Vehicle);
          if (vr.user) setPreloadedUser(vr.user as User);
          setStartDate(vr.startDate ? String(vr.startDate).split("T")[0] : "");
          setEndDate(vr.endDate ? String(vr.endDate).split("T")[0] : "");
          setIsIndefinite(!vr.endDate);
        } else {
          setError(
            resp.message || "No se pudo cargar el responsable de vehículo"
          );
        }
      } catch (e) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isCreateMode]);

  const handleFieldChange = (key: string, value: any) => {
    switch (key) {
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      case "isIndefinite":
        setIsIndefinite(value);
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    if (!startDate) {
      showError("Por favor, complete la fecha de inicio");
      return;
    }

    if (isCreateMode) {
      if (!userSearch.selectedUser && !preloadedUser) {
        showError("Por favor, seleccione un usuario");
        return;
      }
      if (!vehicleSearch.selectedVehicle && !preloadedVehicle) {
        showError("Por favor, seleccione un vehículo");
        return;
      }

      showConfirm("¿Crear nuevo responsable de vehículo?", async () => {
        try {
          const finalUser = userSearch.selectedUser || preloadedUser;
          const finalVehicle =
            vehicleSearch.selectedVehicle || preloadedVehicle;
          if (!finalUser || !finalVehicle) {
            showError("Usuario o vehículo no encontrado");
            return;
          }

          const payload = {
            userId: finalUser.id,
            vehicleId: finalVehicle.id,
            startDate: new Date(startDate + "T00:00:00.000Z").toISOString(),
            endDate:
              isIndefinite || !endDate
                ? null
                : new Date(endDate + "T23:59:59.000Z").toISOString(),
          };

          const resp = await createVehicleResponsible(payload);
          if (resp.success) {
            showSuccess("Responsable creado");
            setTimeout(() => navigate(-1), 1200);
          } else {
            showError(resp.message || "Error al crear responsable");
          }
        } catch (e) {
          showError("Error al crear responsable de vehículo");
        }
      });
    } else {
      showConfirm("¿Guardar cambios al responsable de vehículo?", async () => {
        try {
          if (!id) {
            showError("ID no disponible");
            return;
          }

          const payload: any = {
            startDate: new Date(startDate + "T00:00:00.000Z").toISOString(),
            endDate:
              isIndefinite || !endDate
                ? null
                : new Date(endDate + "T23:59:59.000Z").toISOString(),
          };

          if (
            userSearch.selectedUser &&
            preloadedUser &&
            userSearch.selectedUser.id !== preloadedUser.id
          ) {
            payload.userId = userSearch.selectedUser.id;
          }
          if (
            vehicleSearch.selectedVehicle &&
            preloadedVehicle &&
            vehicleSearch.selectedVehicle.id !== preloadedVehicle.id
          ) {
            payload.vehicleId = vehicleSearch.selectedVehicle.id;
          }

          const resp = await updateVehicleResponsible(id, payload);
          if (resp.success) {
            showSuccess("Responsable actualizado");
            setTimeout(() => navigate(-1), 1200);
          } else {
            showError(resp.message || "Error al actualizar");
          }
        } catch (e) {
          showError("Error al actualizar responsable");
        }
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    showConfirm("¿Eliminar este responsable de vehículo?", async () => {
      try {
        const resp = await deleteVehicleResponsible(id);
        if (resp.success) {
          showSuccess("Responsable eliminado");
          setTimeout(() => navigate(-1), 1200);
        } else {
          showError(resp.message || "Error al eliminar");
        }
      } catch (e) {
        showError("Error al eliminar responsable");
      }
    });
  };

  const handleCancel = () => navigate(-1);

  if (loading) return <LoadingSpinner message="Cargando..." />;
  if (error)
    return (
      <div className="error">
        {error}
        <button onClick={handleCancel} className="btn btn-cancel">
          Volver
        </button>
      </div>
    );

  const currentUser = preloadedUser || userSearch.selectedUser || null;
  const currentVehicle =
    preloadedVehicle || vehicleSearch.selectedVehicle || null;

  const buildFormFields = (): any[] => {
    const fields: any[] = [];

    // Sección de datos del usuario
    if (currentUser) {
      fields.push(
        {
          type: FieldType.TEXT_FIXED,
          title: "CUIT:",
          value: (currentUser.cuit as any) || "",
          key: "userDni",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Nombre:",
          value: currentUser.firstName || "",
          key: "userFirstName",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Apellido:",
          value: currentUser.lastName || "",
          key: "userLastName",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Email:",
          value: currentUser.email || "",
          key: "userEmail",
        }
      );
    } else {
      fields.push({
        type: FieldType.SEARCH,
        title: "Buscar usuario (por nombre, apellido, CUIT)",
        value: userSearch.selectedUser,
        key: "userSearch",
        entityType: EntityType.USER,
        searchTerm: userSearch.searchTerm,
        onSearchChange: userSearch.searchUsers,
        availableEntities: userSearch.availableUsers,
        showDropdown: userSearch.showDropdown,
        onSelect: userSearch.selectUser,
        onDropdownToggle: userSearch.setShowDropdown,
        placeholder: "Buscar por nombre, apellido o CUIT...",
        required: true,
      });
    }

    // Sección de datos del vehículo
    if (currentVehicle) {
      fields.push(
        {
          type: FieldType.TEXT_FIXED,
          title: "Patente:",
          value: currentVehicle.licensePlate || "",
          key: "vehicleLicensePlate",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Marca:",
          value:
            (currentVehicle as any).brandName ||
            currentVehicle.brand ||
            currentVehicle.modelObj?.brand?.name ||
            "",
          key: "vehicleBrand",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Modelo:",
          value:
            (currentVehicle as any).modelName ||
            currentVehicle.model ||
            currentVehicle.modelObj?.name ||
            "",
          key: "vehicleModel",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Año:",
          value: currentVehicle.year?.toString() || "",
          key: "vehicleYear",
        }
      );
    } else {
      fields.push({
        type: FieldType.SEARCH,
        title: "Buscar vehículo (por patente, marca, modelo o año)",
        value: vehicleSearch.selectedVehicle,
        key: "vehicleSearch",
        entityType: EntityType.VEHICLE,
        searchTerm: vehicleSearch.searchTerm,
        onSearchChange: vehicleSearch.searchVehicles,
        availableEntities: vehicleSearch.availableVehicles,
        showDropdown: vehicleSearch.showDropdown,
        onSelect: vehicleSearch.selectVehicle,
        onDropdownToggle: vehicleSearch.setShowDropdown,
        placeholder: "Buscar por patente, marca, modelo o año...",
        required: true,
      });
    }

    // Campos de período
    fields.push(
      {
        type: FieldType.DATE,
        title: "Fecha Desde",
        value: startDate,
        key: "startDate",
        required: true,
        validation: (value: string) => ({
          isValid: !!value,
          message: "La fecha de inicio es requerida",
        }),
      },
      {
        type: FieldType.CHECKBOX,
        title: "Asignación indefinida (sin fecha de fin)",
        value: isIndefinite,
        key: "isIndefinite",
      },
      {
        type: FieldType.DATE,
        title: "Fecha Hasta",
        value: endDate,
        key: "endDate",
        minDate: startDate,
        validation: (value: string) => {
          if (isIndefinite) return { isValid: true };
          if (!value)
            return { isValid: false, message: "La fecha de fin es requerida" };
          if (startDate && value < startDate) {
            return {
              isValid: false,
              message:
                "La fecha de fin debe ser posterior a la fecha de inicio",
            };
          }
          return { isValid: true };
        },
      }
    );

    return fields;
  };

  const formFields = buildFormFields();

  const buttonConfig = {
    primary: {
      text: isCreateMode ? "Crear" : "Guardar",
      onClick: handleSave,
    },
    secondary: !isCreateMode
      ? {
          text: "Eliminar",
          onClick: handleDelete,
        }
      : undefined,
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
  };

  return (
    <>
      <div className="edit-vehicle-responsibles-container">
        <FormLayout
          title={isCreateMode ? "Nuevo Responsable" : "Editar Responsable"}
          formFields={formFields}
          buttonConfig={buttonConfig}
          onFieldChange={handleFieldChange}
          className="edit-vehicle-responsibles"
        />

        <ConfirmDialog
          open={isConfirmOpen}
          message={confirmMessage}
          onConfirm={confirmDialogConfirm}
          onCancel={confirmDialogCancel}
        />
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      </div>
    </>
  );
}
