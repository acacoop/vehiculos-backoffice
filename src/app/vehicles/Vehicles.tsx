import "./Vehicles.css";
import Table from "../../components/Table/table";
import vehiclesData from "../../data/vehicles.json";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Vehículo", width: 180 },
  { field: "patente", headerName: "Patente", width: 120 },
  { field: "usuarioAsignado", headerName: "Usuario Asignado", width: 180 },

  {
    field: "reservas",
    headerName: "Reservas",
    width: 120,
    valueGetter: (row: any) => row.reservas?.length ?? 0,
  },
];

export default function Vehicles() {
  return (
    <div className="vehicles-container">
      <h1 className="vehicles-title">Gestión de Vehículos</h1>
      <Table rows={vehiclesData} columns={columns} title="" />
    </div>
  );
}
