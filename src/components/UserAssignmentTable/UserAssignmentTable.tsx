import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Table from "../Table/table";
import { getAssignments } from "../../services/assignments";
import type { Assignment } from "../../types/assignment";
import "./UserAssignmentTable.css";

interface UserAssignmentTableProps {
  title?: string;
  width?: string;
  vehicleId?: string;
}

export default function UserAssignmentTable({
  title = "Asignaciones",
  width = "900px",
  vehicleId,
}: UserAssignmentTableProps) {
  const navigate = useNavigate();

  // Definición de columnas para la tabla de asignaciones
  const assignmentColumns: GridColDef<Assignment>[] = [
    {
      field: "user.dni",
      headerName: "DNI",
      width: 110,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.row.user.dni?.toLocaleString() || "Sin DNI",
    },
    {
      field: "user.lastName",
      headerName: "Apellido",
      width: 150,
      renderCell: (params) => params.row.user.lastName,
    },
    {
      field: "user.firstName",
      headerName: "Nombre",
      width: 150,
      renderCell: (params) => params.row.user.firstName,
    },
    {
      field: "startDate",
      headerName: "Fecha Desde",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("es-ES");
      },
    },
    {
      field: "endDate",
      headerName: "Fecha Hasta",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (!params.value) return "Indefinida";
        const date = new Date(params.value);
        return date.toLocaleDateString("es-ES");
      },
    },
  ];

  // Función para obtener asignaciones desde el servicio
  const getAssignmentsForTable = async (pagination: {
    page: number;
    pageSize: number;
  }) => {
    try {
      const paginationParams = {
        page: pagination.page,
        limit: pagination.pageSize,
      };

      // Filtrar por vehicleId si se proporciona
      const filterParams = vehicleId ? { vehicleId } : {};

      const response = await getAssignments(filterParams, paginationParams);

      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener asignaciones: ${(error as Error)?.message}`,
        error: error as any,
      };
    }
  };

  return (
    <div className="user-assignment-table-container">
      <div className="user-assignment-table-header">
        <h2 className="title-user-assignment">{title}</h2>
        <button
          className="add-document-btn"
          onClick={() =>
            navigate(
              vehicleId
                ? `/userassignment/create/${vehicleId}`
                : "/userassignment/create"
            )
          }
        >
          + Agregar Asignación
        </button>
      </div>
      {/* Tabla de asignaciones */}
      <div className="table-container" style={{ width, margin: "0 auto" }}>
        <Table<Assignment>
          getRows={getAssignmentsForTable}
          columns={assignmentColumns}
          title=""
          showEditColumn={true}
          editRoute="/userassignment"
        />
      </div>
    </div>
  );
}
