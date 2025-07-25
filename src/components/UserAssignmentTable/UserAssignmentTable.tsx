import { type GridColDef } from "@mui/x-data-grid";
import Table from "../Table/table";
import { getUsers } from "../../services/users";
import type { User } from "../../types/user";
import "./UserAssignmentTable.css";

interface UserAssignmentTableProps {
  title?: string;
  width?: string;
  vehicleId?: string;
}

export default function UserAssignmentTable({
  title = "Usuarios",
  width = "900px",
  vehicleId,
}: UserAssignmentTableProps) {
  // Definición de columnas para la tabla de usuarios
  const userColumns: GridColDef<User>[] = [
    {
      field: "dni",
      headerName: "DNI",
      width: 110,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.value?.toLocaleString() || "Sin DNI",
    },
    { field: "lastName", headerName: "Apellido", width: 150 },
    { field: "firstName", headerName: "Nombre", width: 150 },
    {
      field: "startDate",
      headerName: "Fecha Desde",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: () => "01/01/2024", // Placeholder
    },
    {
      field: "endDate",
      headerName: "Fecha Hasta",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: () => "31/12/2024", // Placeholder
    },
  ];

  // Función para obtener usuarios desde el servicio
  const getUsersForTable = async (pagination: {
    page: number;
    pageSize: number;
  }) => {
    try {
      const paginationParams = {
        page: pagination.page,
        limit: pagination.pageSize,
      };

      const response = await getUsers(
        { active: true }, // Solo usuarios activos
        paginationParams
      );

      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener usuarios: ${(error as Error)?.message}`,
        error: error as any,
      };
    }
  };

  return (
    <div className="user-assignment-table-container">
      <div className="user-assignment-table-header">
        <h2 className="title-user-assignment">{title}</h2>
        <button className="add-document-btn">+ Agregar Usuario</button>
      </div>
      {/* Tabla de usuarios */}
      <div className="table-container" style={{ width, margin: "0 auto" }}>
        <Table<User>
          getRows={getUsersForTable}
          columns={userColumns}
          title=""
          showEditColumn={true}
          editRoute="/userassignment"
          additionalRouteParams={vehicleId ? `/${vehicleId}` : ""}
        />
      </div>
    </div>
  );
}
