import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type {
  MaintenanceChecklist,
  MaintenanceChecklistFilterParams,
} from "../../../types/maintenanceChecklist";
import { getMaintenanceChecklists } from "../../../services/maintenanceChecklists";
import { COLORS } from "../../../common/colors";
import { QUARTER_LABELS } from "../../../common";

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
      transform: (value, row) => {
        if (row.filledAt) {
          if (value) {
            const passed = Number(row.passedCount);
            const total = Number(row.itemCount);
            return `Con fallos (${passed}/${total})`;
          }
          return "Aprobado";
        }
        // Check if late
        const currentDate = new Date();
        const intendedDate = new Date(row.intendedDeliveryDate);
        if (currentDate > intendedDate) {
          return "Tardía";
        }
        return "Pendiente";
      },
      color: (value, row) => {
        if (row.filledAt) {
          return value ? COLORS.error : COLORS.success;
        }
        // Check if late
        const currentDate = new Date();
        const intendedDate = new Date(row.intendedDeliveryDate);
        if (currentDate > intendedDate) {
          return COLORS.error;
        }
        return COLORS.warning;
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
