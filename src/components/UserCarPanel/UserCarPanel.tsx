import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { Table } from "../Table/table";
import { getAssignmentsByUser } from "../../services/assignments";
import type { ServiceResponse, PaginationParams } from "../../common";
import type { User } from "../../types/user";
import type { Assignment } from "../../types/assignment";
import "./UserCarPanel.css";

interface UserCarPanelProps {
  userId: string;
  user: User;
}

export default function UserCarPanel({ userId, user }: UserCarPanelProps) {
  const navigate = useNavigate();

  // Definición de columnas para la tabla de vehículos asignados
  const vehicleColumns: GridColDef<Assignment>[] = [
    {
      field: "vehicle.licensePlate",
      headerName: "Patente",
      width: 70,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.row.vehicle?.licensePlate || "N/A",
    },
    {
      field: "vehicle.brand",
      headerName: "Marca",
      width: 90,
      renderCell: (params) => params.row.vehicle?.brand || "N/A",
    },
    {
      field: "vehicle.model",
      headerName: "Modelo",
      width: 90,
      renderCell: (params) => params.row.vehicle?.model || "N/A",
    },
    {
      field: "startDate",
      headerName: "Desde",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.startDate) {
          const date = new Date(params.row.startDate);
          return date.toLocaleDateString("es-AR");
        }
        return "N/A";
      },
    },
    {
      field: "endDate",
      headerName: "Hasta",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.endDate) {
          const date = new Date(params.row.endDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Indefinido";
      },
    },
  ];

  // Función para obtener asignaciones del usuario con paginación
  const getAssignmentsForTable = async (pagination: {
    page: number;
    pageSize: number;
  }): Promise<ServiceResponse<Assignment[]>> => {
    if (!userId) {
      return {
        success: true,
        data: [],
      };
    }

    try {
      const paginationParams: PaginationParams = {
        page: pagination.page,
        limit: pagination.pageSize,
      };

      const response = await getAssignmentsByUser(userId, paginationParams);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          pagination: response.pagination,
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener asignaciones: ${(error as Error)?.message}`,
      };
    }
  };

  if (!userId) {
    return (
      <div className="user-car-panel-container">
        <div className="user-car-panel-header">
          <h2 className="title-user-car-panel">Vehículos Asignados</h2>
        </div>
        <div style={{ textAlign: "center", color: "#666", marginTop: 16 }}>
          No se ha seleccionado ningún usuario
        </div>
      </div>
    );
  }

  return (
    <div className="user-car-panel-container">
      <div className="user-car-panel-header">
        <h2 className="title-user-car-panel">
          Vehículos Asignados{" "}
          {user ? `a ${user.firstName} ${user.lastName}` : ""}
        </h2>
        <button
          className="add-vehicle-btn"
          onClick={() => navigate(`/assignment/create?userId=${userId}`)}
        >
          + Agregar Vehículo
        </button>
      </div>
      {/* Tabla de vehículos asignados */}
      <div className="table-container">
        <Table<Assignment>
          getRows={getAssignmentsForTable}
          columns={vehicleColumns}
          title=""
          showEditColumn={true}
          editRoute="/assignment/edit"
        />
      </div>
    </div>
  );
}
