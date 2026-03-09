import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../../components/Table";
import type {
  MaintenanceRecord,
  MaintenanceRecordFilterParams,
} from "../../../types/maintenanceRecord";
import { getMaintenanceRecords } from "../../../services/maintenanceRecords";
import { getMaintenances } from "../../../services/maintenances";
import type { Maintenance } from "../../../types/maintenance";

export default function MaintenanceRecordsPage() {
  const navigate = useNavigate();
  const [maintenanceOptions, setMaintenanceOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Cargar tipos de mantenimiento para el filtro select
  useEffect(() => {
    const loadMaintenances = async () => {
      const response = await getMaintenances();
      if (response.success && response.data) {
        setMaintenanceOptions(
          response.data.map((m: Maintenance) => ({
            label: m.name,
            value: m.id,
          })),
        );
      }
    };
    loadMaintenances();
  }, []);

  const filterDefinitions: FilterDefinition<MaintenanceRecordFilterParams>[] = [
    {
      type: "select",
      field: "maintenanceId",
      label: "Tipo de mantenimiento",
      options: maintenanceOptions,
    },
  ];

  const columns: TableColumn<MaintenanceRecord>[] = [
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
      field: "maintenance.name",
      headerName: "Mantenimiento",
      minWidth: 180,
    },
    {
      field: "user",
      headerName: "Usuario",
      minWidth: 180,
      transform: (_value, row) => {
        const user = row.user;
        if (user) {
          return `${user.firstName} ${user.lastName}`.trim();
        }
        return "N/A";
      },
    },
    {
      field: "date",
      headerName: "Fecha",
      minWidth: 140,
      type: "date",
    },
    {
      field: "kilometersLog.kilometers",
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
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: "/" },
          { label: "Registros de mantenimiento" },
        ]}
      />
      <Table<MaintenanceRecordFilterParams, MaintenanceRecord>
        getRows={(options) => getMaintenanceRecords(options)}
        columns={columns}
        filters={{
          definitions: filterDefinitions,
        }}
        header={{
          title: "Registros de mantenimiento",
          addButton: {
            text: "+ Nuevo registro",
            onClick: () => navigate("/maintenance/records/new"),
          },
        }}
        actionColumn={{ route: "/maintenance/records", width: 90 }}
        search={{ enabled: true, placeholder: "Buscar registros..." }}
      />
    </div>
  );
}
