import { useNavigate } from "react-router-dom";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../components/Table/table";
import { getReservations } from "../../services/reservations";
import type {
  Reservation,
  ReservationFilterParams,
} from "../../types/reservation";

const columns: TableColumn<Reservation>[] = [
  {
    field: "user",
    headerName: "Usuario",
    minWidth: 200,
    transform: (_value, row: Reservation) => {
      if (!row || !row.user) return "N/A";
      return `${row.user.firstName} ${row.user.lastName}`;
    },
  },
  {
    field: "vehicle.id",
    headerName: "Vehículo",
    minWidth: 150,
    transform: (_value, row: Reservation) => {
      if (!row) return "N/A";
      return `${row.vehicle.model.brand.name} ${row.vehicle.model.name} - ${row.vehicle.licensePlate}`;
    },
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    minWidth: 180,
    type: "datetime",
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    minWidth: 180,
    type: "datetime",
  },
];

export default function ReservationsPage() {
  const navigate = useNavigate();

  const filterDefinitions: FilterDefinition<ReservationFilterParams>[] = [
    {
      type: "date",
      field: "startDate",
      label: "Fecha desde",
    },
    {
      type: "date",
      field: "endDate",
      label: "Fecha hasta",
    },
  ];

  return (
    <div className="container">
      <Table<ReservationFilterParams, Reservation>
        getRows={getReservations}
        columns={columns}
        filters={{
          definitions: filterDefinitions,
        }}
        header={{
          title: "Reservas",
          addButton: {
            text: "+ Nueva Reserva",
            onClick: () => navigate("/reservations/new"),
          },
        }}
        actionColumn={{
          route: "/reservations",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar reservas...",
        }}
        width={1200}
      />
    </div>
  );
}
