import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getAllMaintenanceAssignments } from "../../../services/maintenanceAssignments";
import type { MaintenanceAssignment } from "../../../types/maintenanceAsignment";
import "./AssignmentsPage.css";

const columns: TableColumn<MaintenanceAssignment>[] = [
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
    <div className="assignments-page">
      <Table
        getRows={getAllMaintenanceAssignments}
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
      />
    </div>
  );
}
