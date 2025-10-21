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
import {
  useUserSearch,
  useVehicleSearch,
  useConfirmDialog,
  useNotification,
} from "../../hooks";
import {
  FormLayout,
  ConfirmDialog,
  NotificationToast,
  LoadingSpinner,
} from "../../components";
import { FieldType, EntityType } from "../../components/FormLayout/FormLayout";
import type { Assignment } from "../../types/assignment";
import type { Vehicle } from "../../types/vehicle";
import { getVehicleBrand, getVehicleModel } from "../../common/utils";
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
              const brand =
                (finalVehicle as any).brandName ||
                finalVehicle.brand ||
                finalVehicle.modelObj?.brand?.name ||
                "";
              const model =
                (finalVehicle as any).modelName ||
                finalVehicle.model ||
                finalVehicle.modelObj?.name ||
                "";
              showError(
                `El vehículo ${brand} ${model} (${finalVehicle.licensePlate}) ya se encuentra asignado a ${finalUser.firstName} ${finalUser.lastName}`
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
    return <LoadingSpinner message="Cargando datos de la asignación..." />;
  }

  if (error || (!assignment && !isCreateMode)) {
    return (
      <div className="edit-assignment-container">
        <div className="error">
          {error || "No se pudo cargar la asignación"}
          <button onClick={handleCancel} className="btn btn-cancel">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const buildFormFields = (): any[] => {
    const fields: any[] = [];

    // Sección de datos del usuario (solo si hay usuario seleccionado/asignado)
    const currentUser =
      assignment?.user || userSearch.selectedUser || preloadedUser;
    if (currentUser) {
      // Datos del usuario (readonly)
      fields.push(
        {
          type: FieldType.TEXT_FIXED,
          title: "CUIT:",
          value: currentUser.cuit?.toLocaleString() || "",
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
      // Campo de búsqueda de usuario
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

    // Sección de datos del vehículo (solo si hay vehículo seleccionado/asignado)
    const currentVehicle =
      assignment?.vehicle || preloadedVehicle || vehicleSearch.selectedVehicle;
    if (currentVehicle) {
      // Datos del vehículo (readonly)
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
          value: getVehicleBrand(currentVehicle),
          key: "vehicleBrand",
        },
        {
          type: FieldType.TEXT_FIXED,
          title: "Modelo:",
          value: getVehicleModel(currentVehicle),
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
      // Campo de búsqueda de vehículo
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

    // Campos de período de asignación
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
      text: isCreateMode ? "Crear Asignación" : "Guardar Asignación",
      onClick: handleSave,
    },
    secondary: !isCreateMode
      ? {
          text: "Eliminar asignación del vehículo",
          onClick: handleUnassign,
        }
      : undefined,
    cancel: {
      text: "Cancelar",
      onClick: handleCancel,
    },
  };

  return (
    <>
      <div className="edit-assignment-container">
        <FormLayout
          title={isCreateMode ? "Nueva Asignación" : "Editar Asignación"}
          formFields={formFields}
          buttonConfig={buttonConfig}
          onFieldChange={handleFieldChange}
          className="edit-assignment"
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
