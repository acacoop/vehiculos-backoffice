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
    console.error("Error formateando fecha:", error, dateString);
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
    console.log(
      "🔍 Obteniendo reservas para tabla con paginación:",
      pagination
    );
    const result = await getReservations(undefined, pagination);
    console.log("📊 Resultado del servicio de reservas:", result);
    console.log("📋 Datos de reservas recibidos:", result.data);
    console.log("🔢 Cantidad de reservas:", result.data?.length);

    // Verificar que cada elemento tenga un ID y la estructura correcta
    if (result.success && result.data) {
      result.data.forEach((reservation, index) => {
        console.log(`📝 Reserva ${index}:`, reservation);
        console.log(
          `📝 Tipo de ID: ${typeof reservation.id}, Valor: ${reservation.id}`
        );
        if (!reservation.id) {
          console.warn(
            `⚠️ Reserva en índice ${index} no tiene ID:`,
            reservation
          );
        }
      });

      // Verificar si los datos tienen el formato correcto para DataGrid
      const firstReservation = result.data[0];
      if (firstReservation) {
        console.log(
          "🔍 Primera reserva - estructura:",
          Object.keys(firstReservation)
        );
      }
    }

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
