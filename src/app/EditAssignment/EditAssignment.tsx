import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAssignmentById,
  createAssignment,
  updateAssignment,
  finishAssignment,
  getAllAssignments,
} from "../../services/assignments";
import { getVehicleById } from "../../services/vehicles";
import { getUserById } from "../../services/users";
import { useUserSearch, useVehicleSearch, useConfirmDialog } from "../../hooks";
import { useNotification } from "../../hooks/useNotification";
import FormLayout from "../../components/FormLayout/FormLayout";
import type { FormSection } from "../../components/FormLayout/FormLayout";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import NotificationToast from "../../components/NotificationToast/NotificationToast";
import {
  CancelButton,
  DeleteButton,
  ConfirmButton,
  ButtonGroup,
} from "../../components/Buttons/Buttons";
import type { Assignment } from "../../types/assignment";
import type { Vehicle } from "../../types/vehicle";
import type { User } from "../../types/user";
import "./EditAssignment.css";

export default function EditAssignment() {
  const { assignmentId, vehicleId } = useParams<{
    assignmentId?: string;
    vehicleId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode = location.pathname.includes("/create");

  const searchParams = new URLSearchParams(location.search);
  const userIdFromQuery = searchParams.get("userId");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preloadedVehicle, setPreloadedVehicle] = useState<Vehicle | null>(
    null
  );
  const [preloadedUser, setPreloadedUser] = useState<User | null>(null);

  const userSearch = useUserSearch();
  const vehicleSearch = useVehicleSearch();

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
    const fetchAssignment = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);

        if (isCreateMode) {
          if (vehicleId) {
            const vehicleResponse = await getVehicleById(vehicleId);
            if (vehicleResponse.success) {
              setPreloadedVehicle(vehicleResponse.data);
            }
          }

          if (userIdFromQuery) {
            const userResponse = await getUserById(userIdFromQuery);
            if (userResponse.success) {
              setPreloadedUser(userResponse.data);
            }
          }

          setLoading(false);
        } else {
          if (!assignmentId) {
            setError("ID de asignación no proporcionado");
            setLoading(false);
            return;
          }

          const response = await getAssignmentById(assignmentId);

          if (response.success && response.data) {
            setAssignment(response.data);
            setStartDate(response.data.startDate.split("T")[0]);
            setEndDate(
              response.data.endDate ? response.data.endDate.split("T")[0] : ""
            );
            setIsIndefinite(!response.data.endDate);
          } else {
            setError(response.message || "No se pudo cargar la asignación");
          }
        }
      } catch (error) {
        setError("Error al cargar los datos de la asignación");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, vehicleId, userIdFromQuery, isCreateMode]);

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

  const checkExistingAssignment = async (
    userId: string,
    vehicleId: string
  ): Promise<boolean> => {
    try {
      const response = await getAllAssignments({
        userId,
        vehicleId,
      });

      if (response.success && response.data.length > 0) {
        const hasActiveAssignment = response.data.some((assignment) => {
          if (!assignment.endDate) return true;
          const endDate = new Date(assignment.endDate);
          return endDate > new Date();
        });
        return hasActiveAssignment;
      }
      return false;
    } catch (error) {
      return false;
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
      if (!preloadedVehicle && !vehicleSearch.selectedVehicle && !vehicleId) {
        showError("Por favor, seleccione un vehículo");
        return;
      }

      showConfirm(
        "¿Está seguro que desea crear esta nueva asignación?",
        async () => {
          try {
            const finalUser = userSearch.selectedUser || preloadedUser;
            const finalVehicle =
              vehicleSearch.selectedVehicle || preloadedVehicle;

            if (!finalUser || !finalVehicle) {
              showError("Error: Usuario o vehículo no encontrado");
              return;
            }

            const hasExistingAssignment = await checkExistingAssignment(
              finalUser.id,
              finalVehicle.id
            );
            if (hasExistingAssignment) {
              showError(
                `El vehículo ${finalVehicle.brand} ${finalVehicle.model} (${finalVehicle.licensePlate}) ya se encuentra asignado a ${finalUser.firstName} ${finalUser.lastName}`
              );
              return;
            }

            const assignmentData = {
              userId: finalUser.id,
              vehicleId: finalVehicle.id,
              startDate: startDate,
              endDate: isIndefinite ? null : endDate || null,
              active: true,
            };

            const response = await createAssignment(assignmentData);

            if (response.success) {
              showSuccess("Nueva asignación creada exitosamente");

              setTimeout(() => {
                navigate(-1);
              }, 1500);
            } else {
              const errorMessage = response.message || "";
              if (
                errorMessage.toLowerCase().includes("already assigned") ||
                errorMessage.toLowerCase().includes("ya asignado") ||
                errorMessage.toLowerCase().includes("duplicate") ||
                errorMessage.toLowerCase().includes("duplicado") ||
                errorMessage.includes("500") ||
                errorMessage.toLowerCase().includes("conflict")
              ) {
                showError(
                  `Este vehículo ya se encuentra asignado a ${finalUser.firstName} ${finalUser.lastName}`
                );
              } else {
                showError(`Error al crear la asignación: ${response.message}`);
              }
            }
          } catch (error) {
            showError("Error al crear la asignación");
          }
        }
      );
    } else {
      showConfirm(
        "¿Está seguro que desea guardar los cambios en esta asignación?",
        async () => {
          try {
            if (!assignmentId || !assignment) {
              showError("Error: ID de asignación no disponible");
              return;
            }

            const startDateISO = new Date(
              startDate + "T00:00:00.000Z"
            ).toISOString();
            const endDateISO =
              isIndefinite || !endDate
                ? null
                : new Date(endDate + "T23:59:59.000Z").toISOString();

            const updateData: any = {
              startDate: startDateISO,
              endDate: endDateISO,
            };

            if (
              userSearch.selectedUser &&
              userSearch.selectedUser.id !== assignment.user.id
            ) {
              updateData.userId = userSearch.selectedUser.id;
            }
            if (
              vehicleSearch.selectedVehicle &&
              vehicleSearch.selectedVehicle.id !== assignment.vehicle.id
            ) {
              updateData.vehicleId = vehicleSearch.selectedVehicle.id;
            }

            const response = await updateAssignment(assignmentId, updateData);

            if (response.success) {
              showSuccess("Asignación actualizada exitosamente");

              setTimeout(() => {
                navigate(-1);
              }, 1500);
            } else {
              showError(
                `Error al actualizar la asignación: ${response.message}`
              );
            }
          } catch (error) {
            showError("Error al actualizar la asignación");
          }
        }
      );
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleUnassign = async () => {
    showConfirm(
      "¿Está seguro que desea desasignar este vehículo? Esta acción establecerá la fecha de fin de la asignación a hoy y no se puede deshacer.",
      async () => {
        try {
          if (!assignmentId) {
            showError("ID de asignación no disponible");
            return;
          }

          const response = await finishAssignment(assignmentId);

          if (response.success) {
            showSuccess("Vehículo desasignado exitosamente");

            setTimeout(() => {
              navigate(-1);
            }, 1500);
          } else {
            showError(`Error al desasignar el vehículo: ${response.message}`);
          }
        } catch (error) {
          showError("Error al desasignar el vehículo");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="edit-assignment-container">
        <div className="loading">Cargando datos de la asignación...</div>
      </div>
    );
  }

  if (error || (!assignment && !isCreateMode)) {
    return (
      <div className="edit-assignment-container">
        <div className="error">
          {error || "No se pudo cargar la asignación"}
          <CancelButton text="Volver" onClick={handleCancel} />
        </div>
      </div>
    );
  }

  // Construir secciones para FormLayout
  const sections: FormSection[] = [];

  // Sección de datos del usuario (solo si hay usuario seleccionado/asignado)
  const currentUser =
    assignment?.user || userSearch.selectedUser || preloadedUser;
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
          label: "DNI",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentUser.dni?.toLocaleString() || "",
        },
        {
          key: "userFirstName",
          label: "Nombre",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentUser.firstName || "",
        },
        {
          key: "userLastName",
          label: "Apellido",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentUser.lastName || "",
        },
        {
          key: "userEmail",
          label: "Email",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentUser.email || "",
        },
      ],
    });
  } else {
    // Sección para buscar usuario
    sections.push({
      title: "Seleccionar Usuario",
      fields: [
        {
          key: "userSearch",
          label: "Buscar usuario (por nombre, apellido, DNI o email)",
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
          placeholder: "Buscar por nombre, apellido, DNI o email...",
          required: true,
        },
      ],
    });
  }

  // Sección de datos del vehículo (solo si hay vehículo seleccionado/asignado)
  const currentVehicle =
    assignment?.vehicle || preloadedVehicle || vehicleSearch.selectedVehicle;
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
          label: "Patente",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentVehicle.licensePlate || "",
        },
        {
          key: "vehicleBrand",
          label: "Marca",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentVehicle.brand || "",
        },
        {
          key: "vehicleModel",
          label: "Modelo",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentVehicle.model || "",
        },
        {
          key: "vehicleYear",
          label: "Año",
          type: "display",
          value: "",
          onChange: () => {},
          displayValue: currentVehicle.year?.toString() || "",
        },
      ],
    });
  } else {
    // Sección para buscar vehículo
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

  // Sección de período de asignación
  sections.push({
    title: "Período de Asignación",
    fields: [
      {
        key: "startDate",
        label: "Fecha Desde",
        type: "date",
        value: startDate,
        onChange: (_key, value) => setStartDate(value as string),
        required: true,
      },
      {
        key: "isIndefinite",
        label: "Asignación indefinida (sin fecha de fin)",
        type: "checkbox",
        value: isIndefinite ? 1 : 0,
        checked: isIndefinite,
        onChange: (_key, value) => setIsIndefinite(value === 1),
      },
      {
        key: "endDate",
        label: "Fecha Hasta",
        type: "date",
        value: endDate,
        onChange: (_key, value) => setEndDate(value as string),
        condition: () => !isIndefinite,
        minDate: startDate,
      },
    ],
  });

  return (
    <>
      <FormLayout
        title={isCreateMode ? "Nueva Asignación" : "Editar Asignación"}
        sections={sections}
        className="edit-assignment"
      >
        <ButtonGroup>
          <CancelButton text="Cancelar" onClick={handleCancel} />
          {!isCreateMode && (
            <DeleteButton
              text="Eliminar asignación del vehículo"
              onClick={handleUnassign}
            />
          )}
          <ConfirmButton
            text={isCreateMode ? "Crear Asignación" : "Guardar Asignación"}
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
    </>
  );
}
