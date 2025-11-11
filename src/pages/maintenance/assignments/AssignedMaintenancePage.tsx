import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type { AssignedMaintenance } from "../../../types/assignedMaintenance";
import { getAssignedMaintenances } from "../../../services/assignedMaintenances";

const columns: TableColumn<AssignedMaintenance>[] = [
  {
    field: "vehicle.licensePlate",
    headerName: "Vehículo",
    minWidth: 150,
  },
  {
    field: "maintenance.name",
    headerName: "Mantenimiento",
    minWidth: 200,
  },
  {
    field: "maintenance.category.name",
    headerName: "Categoría",
    minWidth: 150,
  },
  {
    field: "kilometersFrequency",
    headerName: "Frecuencia KM",
    minWidth: 120,
    transform: (_value, row) => {
      const freq = row.kilometersFrequency;
      return freq ? `${freq.toLocaleString()} km` : "-";
    },
  },
  {
    field: "daysFrequency",
    headerName: "Frecuencia Días",
    minWidth: 120,
    transform: (_value, row) => {
      const freq = row.daysFrequency;
      return freq ? `${freq} días` : "-";
    },
  },
];

export default function AssignmentsPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Table
        getRows={getAssignedMaintenances}
        columns={columns}
        header={{
          title: "Asignaciones de Mantenimiento",
          addButton: {
            text: "+ Nueva Asignación",
            onClick: () => navigate("/maintenance/assignments/new"),
          },
        }}
        actionColumn={{
          route: "/maintenance/assignments",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar asignaciones...",
        }}
        width={1200}
      />
    </div>
  );
}
