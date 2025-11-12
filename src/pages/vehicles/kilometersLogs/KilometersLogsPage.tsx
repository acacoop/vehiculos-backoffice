import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type {
  VehicleKilometersLog,
  KilometersFilterParams,
} from "../../../types/kilometer";
import { getVehicleKilometersLogs } from "../../../services/kilometers";

export default function KilometersLogsPage() {
  const navigate = useNavigate();

  const columns: TableColumn<VehicleKilometersLog>[] = [
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
      field: "date",
      headerName: "Fecha de Registro",
      minWidth: 180,
      type: "date",
    },
    {
      field: "kilometers",
      headerName: "Kilometraje",
      minWidth: 150,
      transform: (value) => (value ? `${value} km` : "N/A"),
    },
    {
      field: "user",
      headerName: "Registrado por",
      minWidth: 180,
      transform: (_value, row) => {
        const user = row.user;
        if (user) {
          return `${user.firstName} ${user.lastName}`.trim();
        }
        return "N/A";
      },
    },
  ];

  return (
    <div className="container">
      <Table<KilometersFilterParams, VehicleKilometersLog>
        getRows={getVehicleKilometersLogs}
        columns={columns}
        header={{
          title: "Registros de Kilometraje",
          addButton: {
            text: "+ Nuevo Registro",
            onClick: () => navigate("/vehicles/kilometersLogs/new"),
          },
        }}
        actionColumn={{ route: "/vehicles/kilometersLogs", width: 90 }}
        search={{ enabled: true, placeholder: "Buscar registros..." }}
        width={1200}
      />
    </div>
  );
}
