import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type {
  MaintenanceChecklist,
  MaintenanceChecklistFilterParams,
} from "../../../types/maintenanceChecklist";
import { getMaintenanceChecklists } from "../../../services/maintenanceChecklists";
import { QUARTER_LABELS } from "../../../common";
import { getChecklistStatus } from "../../../common/utils";

export default function MaintenanceChecklistsPage() {
  const navigate = useNavigate();

  const columns: TableColumn<MaintenanceChecklist>[] = [
    {
      field: "vehicle.licensePlate",
      headerName: "Vehículo",
      minWidth: 180,
      transform: (value, row) => {
        const vehicle = row.vehicle;
        if (vehicle) {
          const brand = vehicle.model?.brand?.name ?? "";
          const model = vehicle.model?.name ?? "";
          const plate = vehicle.licensePlate ?? "";
          const label = `${brand} ${model} - ${plate}`.trim();
          return label || value || "N/A";
        }
        return value || "N/A";
      },
    },
    {
      field: "year",
      headerName: "Período",
      minWidth: 120,
      transform: (value, row) => {
        return `${value} ${QUARTER_LABELS[Number(row.quarter)] || row.quarter}`;
      },
    },
    {
      field: "filledBy",
      headerName: "Completado por",
      minWidth: 180,
      transform: (_value, row) => {
        const user = row.filledBy;
        if (user) {
          return `${user.firstName} ${user.lastName}`;
        }
        return "No completado";
      },
    },
    {
      field: "filledAt",
      headerName: "Fecha",
      minWidth: 140,
      type: "date",
      transform: (value) => value || "No completado",
    },
    {
      field: "hasFailedItems",
      headerName: "Estado",
      minWidth: 180,
      transform: (_value, row) => {
        const { label } = getChecklistStatus(row);
        return label;
      },
      color: (_value, row) => {
        const { color } = getChecklistStatus(row);
        return color;
      },
    },
  ];

  const actionColumn = {
    route: "/maintenance/checklists",
    width: 100,
  };

  return (
    <div className="page-container">
      <Table<MaintenanceChecklistFilterParams, MaintenanceChecklist>
        columns={columns}
        getRows={getMaintenanceChecklists}
        actionColumn={actionColumn}
        search={{
          enabled: true,
          placeholder: "Buscar checklists...",
        }}
        header={{
          title: "Checklists de Mantenimiento",
          addButton: {
            text: "+ Nuevo Checklist",
            onClick: () => navigate("/maintenance/checklists/new"),
          },
        }}
      />
    </div>
  );
}
