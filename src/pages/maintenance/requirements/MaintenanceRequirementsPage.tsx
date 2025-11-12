import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type { MaintenanceRequirement } from "../../../types/maintenanceRequirement";
import { getMaintenanceRequirements } from "../../../services/maintenaceRequirements";

const columns: TableColumn<MaintenanceRequirement>[] = [
  {
    field: "model.name",
    headerName: "Modelo",
    minWidth: 200,
  },
  {
    field: "model.brand.name",
    headerName: "Marca",
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

export default function MaintenanceRequirementsPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Table
        getRows={getMaintenanceRequirements}
        columns={columns}
        header={{
          title: "Requerimientos de Mantenimiento",
          addButton: {
            text: "+ Nuevo Requerimiento",
            onClick: () => navigate("/maintenance/requirements/new"),
          },
        }}
        actionColumn={{
          route: "/maintenance/requirements",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar requerimientos...",
        }}
        width={1200}
      />
    </div>
  );
}
