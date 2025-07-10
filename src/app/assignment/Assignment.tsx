import { Chip, CircularProgress, Alert } from "@mui/material";
import Table from "../../components/Table/table";
import "./Assignment.css";
import { getAssignments } from "../../services/assignments";

import { useAsyncData } from "../../hooks";
import type {
  Assignment,
  AssignmentListApiResponse,
} from "../../types/assignment";

const getRow = (params: any) => params?.row ?? params;

const assignmentColumns = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
  },
  {
    field: "user",
    headerName: "DNI Usuario",
    width: 120,
  },
  {
    field: "userName",
    headerName: "Usuario",
    width: 200,
    valueGetter: (params: any) => {
      const user = getRow(params)?.user;
      return user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "";
    },
  },
  {
    field: "vehiclePlate",
    headerName: "Patente",
    width: 120,
    valueGetter: (params: any) => getRow(params)?.vehicle?.licensePlate ?? "",
  },
  {
    field: "vehicleInfo",
    headerName: "Vehículo",
    width: 200,
    valueGetter: (params: any) => {
      const vehicle = getRow(params)?.vehicle;
      return vehicle
        ? `${vehicle.brand ?? ""} ${vehicle.model ?? ""} (${
            vehicle.year ?? ""
          })`
        : "";
    },
  },
  {
    field: "startDate",
    headerName: "Fecha Inicio",
    width: 130,
    valueGetter: (params: any) => {
      const row = getRow(params);
      const date = row?.startDate ? new Date(row.startDate) : null;
      return date ? date.toLocaleDateString("es-ES") : "";
    },
  },
  {
    field: "endDate",
    headerName: "Fecha Fin",
    width: 130,
    valueGetter: (params: any) => {
      const row = getRow(params);
      if (!row?.endDate) return "Indefinido";
      const date = new Date(row.endDate);
      return date.toLocaleDateString("es-ES");
    },
  },
  {
    field: "status",
    headerName: "Estado",
    width: 120,
    renderCell: (params: any) => {
      const row = getRow(params);
      const isActive = !row?.endDate || new Date(row.endDate) > new Date();
      return (
        <Chip
          label={isActive ? "Activo" : "Finalizado"}
          color={isActive ? "success" : "default"}
          size="small"
          style={{ color: "#fff", fontWeight: 600 }}
        />
      );
    },
  },
];

export default function Assignment() {
  const fetchAssignmentsData = async (): Promise<Assignment[]> => {
    const response: AssignmentListApiResponse = await getAssignments();
    return response.data;
  };

  const {
    data: assignments,
    loading,
    error,
  } = useAsyncData(fetchAssignmentsData);

  console.log(assignments);

  if (loading) {
    return (
      <main className="assignment-container">
        <div className="assignment-header">
          <h1 className="assignment-title">Gestión de Asignaciones</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <CircularProgress />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="assignment-container">
        <div className="assignment-header">
          <h1 className="assignment-title">Gestión de Asignaciones</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  return (
    <main className="assignment-container">
      <div className="assignment-header">
        <h1 className="assignment-title">Gestión de Asignaciones</h1>
      </div>
      <Table rows={assignments || []} columns={assignmentColumns} title="" />
    </main>
  );
}
