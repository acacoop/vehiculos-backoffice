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
  CancelButton,
  DeleteButton,
  ConfirmButton,
  ButtonGroup,
  LoadingSpinner,
} from "../../components";
import type { FormSection } from "../../components";
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

  const canChangeUser = () => {
    if (!isCreateMode) return false;
    if (preloadedUser) return false;
    return userSearch.selectedUser !== null;
  };

  const canChangeVehicle = () => {
    if (!isCreateMode) return false;
    if (preloadedVehicle) return false;
    return vehicleSearch.selectedVehicle !== null;
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
        <CancelButton text="Volver" onClick={handleCancel} />
      </div>
    );

  const currentUser = preloadedUser || userSearch.selectedUser || null;
  const currentVehicle =
    preloadedVehicle || vehicleSearch.selectedVehicle || null;

  const sections: FormSection[] = [];

  if (currentUser) {
    sections.push({
      title: "Datos del Usuario",
      horizontal: true,
      actionButton: canChangeUser()
        ? {
            text: "Cambiar usuario",
            onClick: () => userSearch.clearSelection(),
            className: "action-button",
          }
        : undefined,
      fields: [
        {
          key: "userDni",
          label: "CUIT:",
          type: "text",
          value: (currentUser.cuit as any) || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "userFirstName",
          label: "Nombre:",
          type: "text",
          value: currentUser.firstName || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "userLastName",
          label: "Apellido:",
          type: "text",
          value: currentUser.lastName || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "userEmail",
          label: "Email:",
          type: "email",
          value: currentUser.email || "",
          onChange: () => {},
          disabled: true,
        },
      ],
    });
  } else {
    sections.push({
      title: "Seleccionar Usuario",
      fields: [
        {
          key: "userSearch",
          label: "Buscar usuario (por nombre, apellido, CUIT)",
          type: "userSearch",
          value: "",
          onChange: () => {},
          entitySearch: true,
          searchTerm: userSearch.searchTerm,
          onSearchChange: userSearch.searchUsers,
          availableUsers: userSearch.availableUsers,
          showDropdown: userSearch.showDropdown,
          onUserSelect: userSearch.selectUser,
          onDropdownToggle: userSearch.setShowDropdown,
          placeholder: "Buscar por nombre, apellido o CUIT...",
          required: true,
        },
      ],
    });
  }

  if (currentVehicle) {
    sections.push({
      title: "Datos del Vehículo",
      horizontal: true,
      actionButton: canChangeVehicle()
        ? {
            text: "Cambiar vehículo",
            onClick: () => vehicleSearch.clearSelection(),
            className: "action-button",
          }
        : undefined,
      fields: [
        {
          key: "vehicleLicensePlate",
          label: "Patente:",
          type: "text",
          value: currentVehicle.licensePlate || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "vehicleBrand",
          label: "Marca:",
          type: "text",
          value: currentVehicle.brand || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "vehicleModel",
          label: "Modelo:",
          type: "text",
          value: currentVehicle.model || "",
          onChange: () => {},
          disabled: true,
        },
        {
          key: "vehicleYear",
          label: "Año:",
          type: "number",
          value: currentVehicle.year || 0,
          onChange: () => {},
          disabled: true,
        },
      ],
    });
  } else {
    sections.push({
      title: "Seleccionar Vehículo",
      fields: [
        {
          key: "vehicleSearch",
          label: "Buscar vehículo (por patente, marca, modelo o año)",
          type: "vehicleSearch",
          value: "",
          onChange: () => {},
          entitySearch: true,
          searchTerm: vehicleSearch.searchTerm,
          onSearchChange: vehicleSearch.searchVehicles,
          availableVehicles: vehicleSearch.availableVehicles,
          showDropdown: vehicleSearch.showDropdown,
          onVehicleSelect: vehicleSearch.selectVehicle,
          onDropdownToggle: vehicleSearch.setShowDropdown,
          placeholder: "Buscar por patente, marca, modelo o año...",
          required: true,
        },
      ],
    });
  }

  sections.push({
    title: "Período",
    fields: [
      {
        key: "startDate",
        label: "Fecha Desde",
        type: "date",
        value: startDate,
        onChange: (_k, v) => setStartDate(v as string),
        required: true,
      },
      {
        key: "isIndefinite",
        label: "Asignación indefinida (sin fecha de fin)",
        type: "checkbox",
        value: isIndefinite ? 1 : 0,
        checked: isIndefinite,
        onChange: (_k, v) => setIsIndefinite(v === 1),
      },
      {
        key: "endDate",
        label: "Fecha Hasta",
        type: "date",
        value: endDate,
        onChange: (_k, v) => setEndDate(v as string),
        condition: () => !isIndefinite,
        minDate: startDate,
      },
    ],
  });

  return (
    <>
      <div className="edit-vehicle-responsibles-container">
        <FormLayout
          title={isCreateMode ? "Nuevo Responsable" : "Editar Responsable"}
          sections={sections}
          className="edit-vehicle-responsibles"
        >
          <ButtonGroup>
            <CancelButton text="Cancelar" onClick={handleCancel} />
            {!isCreateMode && (
              <DeleteButton text="Eliminar" onClick={handleDelete} />
            )}
            <ConfirmButton
              text={isCreateMode ? "Crear" : "Guardar"}
              onClick={handleSave}
            />
          </ButtonGroup>
        </FormLayout>

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
