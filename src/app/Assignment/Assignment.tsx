import "./Assignment.css";
import Table from "../../components/Table/table";
import { getAssignments } from "../../services/assignments";
import type { Assignment } from "../../types/assignment";
import type { ServiceResponse, PaginationParams } from "../../common";
import { type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const isAssignmentActive = (endDate: string | null | undefined): boolean => {
  if (!endDate) return true;

  try {
    const endDateTime = new Date(endDate);
    return endDateTime > new Date();
  } catch {
    return false;
  }
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "Sin fecha";

  try {
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime())
      ? "Fecha inválida"
      : dateObj.toLocaleDateString("es-AR");
  } catch {
    return "Fecha inválida";
  }
};

const assignmentColumns: GridColDef<Assignment>[] = [
  {
    field: "user.cuit",
    headerName: "CUIT Usuario",
    width: 90,
    renderCell: (params) =>
      params.row.user.cuit?.toLocaleString() || "Sin CUIT",
  },
  {
    field: "user.name",
    headerName: "Usuario",
    width: 200,
    valueGetter: (_, row) => `${row.user.firstName} ${row.user.lastName}`,
    renderCell: (params) =>
      `${params.row.user.firstName} ${params.row.user.lastName}`,
  },
  {
    field: "vehicle.licensePlate",
    headerName: "Patente",
    width: 120,
    valueGetter: (_, row) => row.vehicle?.licensePlate || "N/A",
    renderCell: (params) => params.row.vehicle?.licensePlate || "N/A",
  },
  {
    field: "vehicleBrand",
    headerName: "Marca",
    width: 140,
    valueGetter: (_, row) =>
      row.vehicle
        ? (row.vehicle as any).brandName ||
          row.vehicle.brand ||
          row.vehicle.modelObj?.brand?.name ||
          "N/A"
        : "N/A",
  },
  {
    field: "vehicleModel",
    headerName: "Modelo",
    width: 160,
    valueGetter: (_, row) =>
      row.vehicle
        ? (row.vehicle as any).modelName ||
          row.vehicle.model ||
          row.vehicle.modelObj?.name ||
          "N/A"
        : "N/A",
  },
  {
    field: "vehicleYear",
    headerName: "Año",
    width: 110,
    valueGetter: (_, row) =>
      row.vehicle?.year ? row.vehicle.year.toString() : "N/A",
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    width: 130,
    renderCell: (params) => formatDate(params.row.startDate),
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    width: 130,
    renderCell: (params) =>
      params.row.endDate ? formatDate(params.row.endDate) : "Sin fecha fin",
  },
  {
    field: "status",
    headerName: "Estado",
    width: 100,
    valueGetter: (_, row) =>
      isAssignmentActive(row.endDate) ? "Activa" : "Finalizada",
    renderCell: (params) => {
      const isActive = isAssignmentActive(params.row.endDate);
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
  paginationParams: PaginationParams
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

export default function Assignment() {
  const navigate = useNavigate();

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
        maxWidth="1200px"
        showAddButton={true}
        addButtonText="+ Agregar Asignación"
        onAddButtonClick={() => navigate("/assignment/create")}
      />
    </main>
  );
}
