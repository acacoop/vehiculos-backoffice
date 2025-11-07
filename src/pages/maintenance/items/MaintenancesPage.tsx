import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getMaintenances } from "../../../services/maintenances";
import type { Maintenance } from "../../../types/maintenance";
import "./MaintenancesPage.css";

const columns: TableColumn<Maintenance>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 250,
  },
  {
    field: "category.name",
    headerName: "Categoría",
    minWidth: 200,
  },
  {
    field: "kilometersFrequency",
    headerName: "Frecuencia (Km)",
    minWidth: 150,
  },
  {
    field: "daysFrequency",
    headerName: "Frecuencia (Días)",
    minWidth: 150,
  },
  {
    field: "observations",
    headerName: "Observaciones",
    minWidth: 300,
  },
];

export default function MaintenancesPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Table
        getRows={getMaintenances}
        columns={columns}
        header={{
          title: "Mantenimientos",
          addButton: {
            text: "+ Nuevo Mantenimiento",
            onClick: () => navigate("/maintenance/items/new"),
          },
        }}
        actionColumn={{
          route: "/maintenance/items",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar mantenimientos...",
        }}
        width={1200}
      />
    </div>
  );
}
