import "./Assignment.css";
import { Table } from "../../components/Table/table";
import { getAssignments } from "../../services/assignments";
import type { Assignment } from "../../types/assignment";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { TableColumn } from "../../components/Table/types";
import { formatDate } from "../../common/date";
import { isAssignmentActive } from "../../common/utils";
import type { PaginationParams } from "../../common/types";
import type { ServiceResponse } from "../../common/types";

const assignmentColumns: TableColumn<Assignment>[] = [
  {
    field: "user.cuit",
    headerName: "CUIT Usuario",
    width: 90,
  },
  {
    field: "user.firstName",
    headerName: "Usuario",
    width: 200,
    transform: (value, row) => `${row.user.firstName} ${row.user.lastName}`,
  },
  {
    field: "vehicle.licensePlate",
    headerName: "Patente",
    width: 120,
  },
  {
    field: "vehicle.modelObj.brand.name",
    headerName: "Marca",
    width: 140,
  },
  {
    field: "vehicle.modelObj.name",
    headerName: "Modelo",
    width: 160,
  },
  {
    field: "vehicle.year",
    headerName: "Año",
    width: 110,
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    width: 130,
    transform: (value) => formatDate(value),
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    width: 130,
    transform: (value, row) => (value ? formatDate(value) : "Sin fecha fin"),
  },
  {
    field: "endDate",
    headerName: "Estado",
    width: 100,
    transform: (value) => {
      const isActive = isAssignmentActive(value);
      return (
        <Chip
          label={isActive ? "Activa" : "Finalizada"}
          color={isActive ? "success" : "default"}
          size="small"
          style={{
            color: "#fff",
            fontWeight: 600,
            backgroundColor: isActive ? undefined : "#E53935",
          }}
        />
      );
    },
  },
];

const getAssignmentsData = async (
  paginationParams: PaginationParams,
): Promise<ServiceResponse<Assignment[]>> => {
  try {
    const response = await getAssignments({ pagination: paginationParams });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    }
    return {
      success: false,
      data: [],
      message: response.message || "Error al obtener asignaciones",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: `Error al obtener asignaciones: ${
        (error as Error)?.message || "Error desconocido"
      }`,
    };
  }
};

export default function AssignmentPage() {
  const navigate = useNavigate();

  return (
    <main className="assignment-container">
      <Table
        showTableHeader={true}
        headerTitle="Gestión de Asignaciones"
        getRows={getAssignmentsData}
        columns={assignmentColumns}
        title=""
        showEditColumn={true}
        editRoute="/assignment/edit"
        maxWidth="1200px"
        showAddButton={true}
        addButtonText="+ Agregar Asignación"
        onAddButtonClick={() => navigate("/assignment/create")}
      />
    </main>
  );
}
