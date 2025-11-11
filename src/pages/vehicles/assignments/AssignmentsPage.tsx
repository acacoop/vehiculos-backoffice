import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getAssignments } from "../../../services/assignments";
import type { Assignment } from "../../../types/assignment";
import { formatDate } from "../../../common/date";
import { COLORS } from "../../../common/colors";

const columns: TableColumn<Assignment>[] = [
  {
    field: "user",
    headerName: "Usuario",
    minWidth: 200,
    transform: (_value, row) => `${row.user.firstName} ${row.user.lastName}`,
  },
  {
    field: "vehicle",
    headerName: "Vehículo",
    minWidth: 260,
    transform: (_value, row) => {
      const brand = row.vehicle?.model?.brand?.name ?? "-";
      const model = row.vehicle?.model?.name ?? "-";
      const plate = row.vehicle?.licensePlate ?? "-";
      return `${brand} ${model} - ${plate}`;
    },
  },
  {
    field: "vehicle.year",
    headerName: "Año",
    minWidth: 110,
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    minWidth: 130,
    transform: (value) => (value ? formatDate(value) : "-"),
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    minWidth: 130,
    transform: (value) => (value ? formatDate(value) : "Sin fecha fin"),
  },
  {
    field: "status",
    headerName: "Estado",
    minWidth: 100,
    transform: (_value, row) => {
      const isActive = !row.endDate || new Date(row.endDate) > new Date();
      return isActive ? "Activa" : "Finalizada";
    },
    color: (_value, row) => {
      const isActive = !row.endDate || new Date(row.endDate) > new Date();
      return isActive ? COLORS.success : COLORS.error;
    },
  },
];

export default function AssignmentsPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Table
        getRows={getAssignments}
        columns={columns}
        header={{
          title: "Gestión de Asignaciones",
          addButton: {
            text: "+ Agregar Asignación",
            onClick: () => navigate("/vehicles/assignments/new"),
          },
        }}
        actionColumn={{ route: "/vehicles/assignments" }}
        search={{ enabled: true, placeholder: "Buscar asignaciones..." }}
        width={1200}
      />
    </div>
  );
}
