import { type GridColDef } from "@mui/x-data-grid";
import "./ReservePanel.css";
import Table from "../Table/table";
import { getReservations } from "../../services/reservations";
import type { Reservation } from "../../types/reservation";

const formatDateTime = (dateString: string) => {
  try {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleString("es-ES");
  } catch (error) {
    return "Error en fecha";
  }
};

export default function ReservePanel() {
  // Definir las columnas para la tabla de reservas
  const reservationColumns: GridColDef<Reservation>[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "vehicleId",
      headerName: "ID Vehículo",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "userId",
      headerName: "ID Usuario",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "startDate",
      headerName: "Fecha Inicio",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => formatDateTime(params.value),
    },
    {
      field: "endDate",
      headerName: "Fecha Fin",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => formatDateTime(params.value),
    },
  ];

  const getReservationsForTable = async (pagination: any) => {
    const result = await getReservations(undefined, pagination);
    return result;
  };

  return (
    <div className="reserve-panel">
      <div className="reserve-panel-header">
        <h2 className="title">Panel de Reservas</h2>
      </div>
      <div className="reserve-panel-content">
        <Table<Reservation>
          getRows={getReservationsForTable}
          columns={reservationColumns}
          title=""
          showEditColumn={false}
        />
      </div>
    </div>
  );
}
