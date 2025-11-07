import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { Table } from "../../components/Table/table";
import type { TableColumn } from "../../components/Table/table";
import Form from "../../components/Form/Form";
import type { FormSection } from "../../components/Form/Form";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import { getUserById } from "../../services/users";
import { getAssignments } from "../../services/assignments";
import { getReservations } from "../../services/reservations";
import type { User } from "../../types/user";
import type {
  Assignment,
  AssignmentFilterParams,
} from "../../types/assignment";
import type {
  Reservation,
  ReservationFilterParams,
} from "../../types/reservation";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/users");
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(id);
        if (response.success && response.data) {
          setUserData(response.data);
        } else {
          setError("Error al cargar usuario");
        }
      } catch {
        setError("Error al cargar usuario");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, navigate]);

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
      headerName: "Fecha Inicio",
      width: 150,
      type: "datetime",
    },
    {
      field: "endDate",
      headerName: "Fecha Fin",
      width: 150,
      type: "datetime",
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos del usuario..." />;
  }

  if (error || !userData) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Error</h1>
        <p>{error || "Usuario no encontrado"}</p>
        <button onClick={() => navigate("/users")}>Volver a usuarios</button>
      </div>
    );
  }

  const handleStatusToggle = (newState: boolean) => {
    setUserData((prev) => (prev ? { ...prev, active: newState } : null));
  };

  const userInfoSections: FormSection[] = [
    {
      type: "fields",
      title: "Información Personal",
      layout: "grid",
      columns: 2,
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
      ],
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "50px",
      }}
    >
      <Form title="Detalle del Usuario" sections={userInfoSections} />

      <StatusToggle
        entityId={id!}
        entityType="user"
        active={userData.active}
        onToggle={handleStatusToggle}
      />

      <Table<AssignmentFilterParams, Assignment>
        getRows={(options) =>
          getAssignments({
            ...options,
            filters: { ...options?.filters, userId: id },
          })
        }
        columns={assignmentColumns}
        header={{
          title: "Vehículos Asignados",
          addButton: {
            text: "Agregar Vehículo",
            onClick: () => navigate(`/assignments/create?userId=${id}`),
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
      />

      <Table<ReservationFilterParams, Reservation>
        getRows={(options) =>
          getReservations({
            ...options,
            filters: { ...options?.filters, userId: id },
          })
        }
        columns={reservationColumns}
        header={{
          title: "Reservas de Vehículos",
          addButton: {
            text: "Nueva Reserva",
            onClick: () => navigate(`/reservations/create?userId=${id}`),
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
      />
    </div>
  );
}
