import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getVehicleResponsibles } from "../../../services/vehicleResponsibles";
import type { VehicleResponsible } from "../../../types/vehicleResponsible";

const columns: TableColumn<VehicleResponsible>[] = [
  { field: "user.cuit", headerName: "CUIT", minWidth: 120 },
  { field: "user.firstName", headerName: "Nombre", minWidth: 150 },
  { field: "user.lastName", headerName: "Apellido", minWidth: 150 },
  { field: "vehicle.model.brand.name", headerName: "Marca", minWidth: 140 },
  { field: "vehicle.model.name", headerName: "Modelo", minWidth: 140 },
  { field: "vehicle.licensePlate", headerName: "Patente", minWidth: 120 },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    minWidth: 130,
    type: "date",
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    minWidth: 130,
    type: "enddate",
  },
];

export default function ResponsiblesPage() {
  const navigate = useNavigate();

  return (
    <div className="responsibles-page">
      <Table
        getRows={getVehicleResponsibles}
        columns={columns}
        header={{
          title: "Responsables de Vehículos",
          addButton: {
            text: "+ Agregar Responsable",
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
        width={1200}
      />
    </div>
  );
}
