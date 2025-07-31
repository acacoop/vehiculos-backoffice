import "./Assignment.css";
import Table from "../../components/Table/table";
import { getAssignments } from "../../services/assignments";
import type { Assignment } from "../../types/assignment";
import type { ServiceResponse, PaginationParams } from "../../common";
import { type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

const assignmentColumns: GridColDef<Assignment>[] = [
  {
    field: "user.dni",
    headerName: "DNI Usuario",
    width: 90,
    renderCell: (params) => params.row.user.dni?.toLocaleString() || "Sin DNI",
  },
  {
    field: "user.name",
    headerName: "Usuario",
    width: 200,
    renderCell: (params) =>
      `${params.row.user.firstName} ${params.row.user.lastName}`,
  },
  {
    field: "vehicle.licensePlate",
    headerName: "Patente",
    width: 120,
    renderCell: (params) => params.row.vehicle?.licensePlate || "N/A",
  },
  {
    field: "vehicle.info",
    headerName: "Vehículo",
    width: 200,
    renderCell: (params) => {
      const vehicle = params.row.vehicle;
      return vehicle
        ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
        : "N/A";
    },
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    width: 130,
    renderCell: (params) => {
      if (params.row.startDate) {
        const date = new Date(params.row.startDate);
        return date.toLocaleDateString("es-AR");
      }
      return "Sin fecha";
    },
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    width: 130,
    renderCell: (params) => {
      if (params.row.endDate) {
        const date = new Date(params.row.endDate);
        return date.toLocaleDateString("es-AR");
      }
      return "Activa";
    },
  },
  {
    field: "status",
    headerName: "Estado",
    width: 100,
    renderCell: (params) => {
      const isActive =
        !params.row.endDate || new Date(params.row.endDate) > new Date();
      return (
        <Chip
          label={isActive ? "Activa" : "Finalizada"}
          color={isActive ? "success" : "default"}
          size="small"
          style={{ color: "#fff", fontWeight: 600 }}
        />
      );
    },
  },
];

export default function Assignment() {
  // Función para obtener asignaciones con paginación
  const getAssignmentsData = async (
    paginationParams: PaginationParams
  ): Promise<ServiceResponse<Assignment[]>> => {
    try {
      const response = await getAssignments({}, paginationParams);
      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Error al obtener asignaciones: ${(error as Error)?.message}`,
      };
    }
  };

  return (
    <main className="assignment-container">
      <Table<Assignment>
        showTableHeader={true}
        headerTitle="Gestión de Asignaciones"
        getRows={getAssignmentsData}
        columns={assignmentColumns}
        title=""
        showEditColumn={true}
        editRoute="/assignment/edit"
        tableWidth="1200px"
        showAddButton={true}
        addButtonText="+ Agregar Asignación"
        addButtonRoute="/assignment/create"
      />
    </main>
  );
}
