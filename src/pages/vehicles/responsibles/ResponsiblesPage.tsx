import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../../components/Table";
import { getVehicleResponsibles } from "../../../services/vehicleResponsibles";
import type {
  VehicleResponsible,
  VehicleResponsibleFilterParams,
} from "../../../types/vehicleResponsible";

const columns: TableColumn<VehicleResponsible>[] = [
  {
    field: "user",
    headerName: "Usuario",
    minWidth: 220,
    transform: (_value, row) => {
      const user = row.user;
      if (user) {
        return `${user.firstName} ${user.lastName} (${user.cuit})`;
      }
      return "N/A";
    },
  },
  {
    field: "vehicle",
    headerName: "Vehículo",
    minWidth: 220,
    transform: (_value, row) => {
      const vehicle = row.vehicle;
      if (vehicle && vehicle.model && vehicle.model.brand) {
        return `${vehicle.model.brand.name} ${vehicle.model.name} (${vehicle.licensePlate})`;
      }
      return "N/A";
    },
  },
  { field: "ceco", headerName: "CECO", minWidth: 100 },
  {
    field: "startDate",
    headerName: "Fecha inicio",
    minWidth: 130,
    type: "date",
  },
  {
    field: "endDate",
    headerName: "Fecha fin",
    minWidth: 130,
    type: "enddate",
  },
];

// Definición de filtros disponibles
const filterDefinitions: FilterDefinition<VehicleResponsibleFilterParams>[] = [
  {
    type: "boolean",
    field: "active",
    label: "Estado",
    trueLabel: "Activo",
    falseLabel: "Inactivo",
  },
  {
    type: "date",
    field: "date",
    label: "Fecha",
  },
  {
    type: "text",
    field: "ceco",
    label: "CECO",
  },
];

export default function ResponsiblesPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: "/" },
          { label: "Responsables" },
        ]}
      />
      <Table<VehicleResponsibleFilterParams, VehicleResponsible>
        getRows={getVehicleResponsibles}
        columns={columns}
        header={{
          title: "Responsables de vehículos",
          addButton: {
            text: "+ Agregar responsable",
            onClick: () => navigate("/vehicles/responsibles/new"),
          },
        }}
        actionColumn={{
          route: "/vehicles/responsibles",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar responsables...",
        }}
        filters={{
          definitions: filterDefinitions,
        }}
        width={1200}
      />
    </div>
  );
}
