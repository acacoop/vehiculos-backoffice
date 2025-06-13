import "./ReservePanel.css";
import Table from "../Table/table";
import reservas from "../../data/reservas.json";

const columns = [
  { field: "mes", headerName: "Mes" },
  { field: "dia", headerName: "Día" },
  { field: "horario", headerName: "Horario" },
  { field: "usuario", headerName: "Usuario" },
  { field: "vehiculo", headerName: "Vehículo" },
];

export default function ReservePanel() {
  return (
    <div className="reserve-panel">
      <div className="reserve-panel-header">
        <h2 className="title">Panel de Reservas</h2>
      </div>
      <div className="reserve-panel-content">
        <Table rows={reservas} columns={columns} title={""} />
      </div>
    </div>
  );
}
