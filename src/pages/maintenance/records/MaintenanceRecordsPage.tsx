import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import type {
  MaintenanceRecord,
  MaintenanceRecordFilterParams,
} from "../../../types/maintenanceRecord";
import { getMaintenanceRecords } from "../../../services/maintenanceRecords";

export default function MaintenanceRecordsPage() {
  const navigate = useNavigate();

  const columns: TableColumn<MaintenanceRecord>[] = [
    {
      field: "assignedMaintenance.maintenance.category.name",
      headerName: "Categoría",
      minWidth: 200,
    },
    {
      field: "assignedMaintenance.maintenance.name",
      headerName: "Mantenimiento",
      minWidth: 220,
    },
    {
      field: "assignedMaintenance.vehicle.licensePlate",
      headerName: "Vehículo",
      minWidth: 140,
      transform: (value, row) => {
        const vehicle = row.assignedMaintenance?.vehicle;
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
      headerName: "Fecha",
      minWidth: 140,
      type: "date",
    },
    {
      field: "kilometers",
      headerName: "Kilómetros",
      minWidth: 130,
      transform: (value) => (value ? `${value} km` : "N/A"),
    },
    {
      field: "notes",
      headerName: "Observaciones",
      minWidth: 300,
      transform: (value) => value || "Sin observaciones",
    },
  ];

  return (
    <div className="container">
      <Table<MaintenanceRecordFilterParams, MaintenanceRecord>
        getRows={(options) => getMaintenanceRecords(options)}
        columns={columns}
        header={{
          title: "Registros de Mantenimiento",
          addButton: {
            text: "+ Nuevo Registro",
            onClick: () => navigate("/maintenance/records/new"),
          },
        }}
        actionColumn={{ route: "/maintenance/records", width: 90 }}
        search={{ enabled: true, placeholder: "Buscar registros..." }}
      />
    </div>
  );
}
