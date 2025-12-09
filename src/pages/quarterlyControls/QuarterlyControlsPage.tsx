import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../components/Table/table";
import type {
  QuarterlyControl,
  QuarterlyControlFilterParams,
} from "../../types/quarterlyControl";
import { getQuarterlyControls } from "../../services/quarterlyControls";
import { QUARTER_LABELS, formatDate } from "../../common";
import { getQuarterlyControlStatus } from "../../common/utils";

export default function QuarterlyControlsPage() {
  const navigate = useNavigate();

  const columns: TableColumn<QuarterlyControl>[] = [
    {
      field: "vehicle.licensePlate",
      headerName: "Vehículo",
      flex: 2,
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
      flex: 1,
      transform: (value, row) => {
        return `${value} ${QUARTER_LABELS[Number(row.quarter)] || row.quarter}`;
      },
    },
    {
      field: "filledBy",
      headerName: "Completado por",
      flex: 1,
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
      headerName: "Fecha de completado",
      flex: 1,
      transform: (value) => (value ? formatDate(value) : "No completado"),
    },
    {
      field: "hasFailedItems",
      headerName: "Estado",
      flex: 1,
      transform: (_value, row) => {
        const { label } = getQuarterlyControlStatus(row);
        return label;
      },
      color: (_value, row) => {
        const { color } = getQuarterlyControlStatus(row);
        return color;
      },
    },
  ];

  const actionColumn = {
    route: "/quarterly-controls",
    width: 100,
  };

  return (
    <div className="page-container">
      <Table<QuarterlyControlFilterParams, QuarterlyControl>
        columns={columns}
        getRows={getQuarterlyControls}
        actionColumn={actionColumn}
        search={{
          enabled: true,
          placeholder: "Buscar controles...",
        }}
        header={{
          title: "Controles Trimestrales",
          addButton: {
            text: "+ Nuevo Control",
            onClick: () => navigate("/quarterly-controls/new"),
          },
        }}
        width={1200}
      />
    </div>
  );
}
