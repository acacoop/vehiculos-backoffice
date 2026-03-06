import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { Table } from "../../components/Table";
import type { TableColumn } from "../../components/Table";
import { TableSelector } from "../../components/TableSelector";
import Form from "../../components/Form/Form";
import type { FormSection } from "../../components/Form/Form";
import { getUserById, updateUserStatus } from "../../services/users";
import { getAssignments } from "../../services/assignments";
import { getReservations } from "../../services/reservations";
import { getVehicleResponsibles } from "../../services/vehicleResponsibles";
import { usePageState } from "../../hooks";
import type { User } from "../../types/user";
import type {
  Assignment,
  AssignmentFilterParams,
} from "../../types/assignment";
import type {
  Reservation,
  ReservationFilterParams,
} from "../../types/reservation";
import type { VehicleResponsibleFilterParams } from "../../types/vehicleResponsible";
import { Car, CalendarDays, UserCheck, ArrowLeftFromLine } from "lucide-react";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();

  const [userData, setUserData] = useState<Partial<User>>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { loading, executeLoad, showError, goTo, goToWithData } = usePageState<
    Partial<User>
  >({
    startInViewMode: true,
    redirectOnSuccess: "/users",
  });

  useEffect(() => {
    if (!id) {
      goTo("/users");
      return;
    }

    executeLoad(async () => {
      const response = await getUserById(id);
      if (response.success && response.data) {
        setUserData(response.data);
      } else {
        showError(response.message || "Error al cargar usuario");
      }
    }, "Error al cargar usuario");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Assignment columns
  const assignmentColumns: TableColumn<Assignment>[] = [
    {
      field: "vehicle.licensePlate",
      headerName: "Patente",
      width: 120,
    },
    {
      field: "vehicle.model.brand.name",
      headerName: "Marca",
      width: 150,
    },
    {
      field: "vehicle.model.name",
      headerName: "Modelo",
      width: 150,
    },
    {
      field: "startDate",
      headerName: "Desde",
      width: 120,
      type: "date",
    },
    {
      field: "endDate",
      headerName: "Hasta",
      width: 120,
      type: "enddate",
    },
  ];

  // Reservation columns
  const reservationColumns: TableColumn<Reservation>[] = [
    {
      field: "vehicle.licensePlate",
      headerName: "Vehículo",
      width: 120,
    },
    {
      field: "vehicle.model.brand.name",
      headerName: "Marca",
      width: 120,
    },
    {
      field: "vehicle.model.name",
      headerName: "Modelo",
      width: 120,
    },
    {
      field: "startDate",
      headerName: "Fecha inicio",
      width: 150,
      type: "datetime",
    },
    {
      field: "endDate",
      headerName: "Fecha fin",
      width: 150,
      type: "datetime",
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos del usuario..." />;
  }

  const userName =
    userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : "Usuario";
  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Usuarios", href: "/users" },
    { label: userName },
  ];

  const handleStatusToggle = async (newState: boolean) => {
    if (!id) return;

    setIsUpdatingStatus(true);
    try {
      const response = await updateUserStatus(id, newState);
      if (response.success) {
        setUserData((prev) => ({ ...prev, active: newState }));
      } else {
        showError(response.message || "Error al actualizar estado");
      }
    } catch {
      showError("Error al actualizar estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isActive = Boolean(userData.active);

  const userInfoSections: FormSection[] = [
    {
      type: "fields",
      title: "Información personal",
      layout: "vertical",
      fields: [
        {
          key: "firstName",
          label: "Nombre",
          type: "display",
          value: userData.firstName,
        },
        {
          key: "lastName",
          label: "Apellido",
          type: "display",
          value: userData.lastName,
        },
        {
          key: "email",
          label: "Email",
          type: "display",
          value: userData.email,
        },
        {
          key: "cuit",
          label: "CUIT",
          type: "display",
          value: userData.cuit,
        },
        {
          type: "switch",
          key: "active",
          label: "Estado del usuario",
          value: isActive,
          onChange: handleStatusToggle,
          activeText: "Usuario activo",
          inactiveText: "Usuario bloqueado",
          disabled: isUpdatingStatus,
          confirmMessage: isActive
            ? "¿Estás seguro de que quieres bloquear a este usuario? Perderá acceso al sistema."
            : "¿Estás seguro de que quieres activar a este usuario? Recuperará acceso al sistema.",
          confirmTitle: isActive ? "Bloquear usuario" : "Activar usuario",
          confirmText: isActive ? "Bloquear" : "Activar",
          cancelText: "Cancelar",
        },
      ],
    },
  ];

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        backButton={{
          icon: <ArrowLeftFromLine size={16} />,
          text: "Volver",
          href: "/users",
        }}
      />

      <Form title="Detalle del usuario" sections={userInfoSections} />

      <TableSelector
        tabs={[
          {
            id: "responsibles",
            label: "Vehículos bajo responsabilidad",
            icon: UserCheck,
            table: (
              <Table<VehicleResponsibleFilterParams, Assignment>
                getRows={(options) =>
                  getVehicleResponsibles({
                    ...options,
                    filters: { ...options?.filters, userId: id },
                  })
                }
                columns={assignmentColumns}
                header={{
                  title: "Vehículos bajo responsabilidad",
                  addButton: {
                    text: "+ Agregar responsable",
                    onClick: () =>
                      userData.id &&
                      goToWithData("/vehicles/responsibles/new", {
                        user: userData,
                      }),
                  },
                }}
                actionColumn={{
                  route: "/vehicles/responsibles",
                  width: 80,
                }}
                search={{
                  enabled: true,
                  placeholder: "Buscar responsables...",
                }}
                minHeight="500px"
              />
            ),
          },
          {
            id: "assignments",
            label: "Vehículos asignados",
            icon: Car,
            table: (
              <Table<AssignmentFilterParams, Assignment>
                getRows={(options) =>
                  getAssignments({
                    ...options,
                    filters: { ...options?.filters, userId: id },
                  })
                }
                columns={assignmentColumns}
                header={{
                  title: "Vehículos asignados",
                  addButton: {
                    text: "Agregar vehículo",
                    onClick: () =>
                      userData.id &&
                      goToWithData("/vehicles/assignments/new", {
                        user: userData,
                      }),
                  },
                }}
                actionColumn={{
                  route: "/assignments",
                  width: 80,
                }}
                search={{
                  enabled: true,
                  placeholder: "Buscar asignaciones...",
                }}
                minHeight="500px"
              />
            ),
          },
          {
            id: "reservations",
            label: "Reservas",
            icon: CalendarDays,
            table: (
              <Table<ReservationFilterParams, Reservation>
                getRows={(options) =>
                  getReservations({
                    ...options,
                    filters: { ...options?.filters, userId: id },
                  })
                }
                columns={reservationColumns}
                header={{
                  title: "Reservas de vehículos",
                  addButton: {
                    text: "+ Nueva reserva",
                    onClick: () =>
                      userData.id &&
                      goToWithData("/reservations/new", { user: userData }),
                  },
                }}
                actionColumn={{
                  route: "/reservations",
                  width: 80,
                }}
                search={{
                  enabled: true,
                  placeholder: "Buscar reservas...",
                }}
                minHeight="500px"
              />
            ),
          },
        ]}
      />
    </div>
  );
}
