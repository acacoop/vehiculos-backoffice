import { Chip, CircularProgress, Alert } from "@mui/material";
import Table from "../../components/Table/table";
import "./Assignment.css";
import { getAssignments } from "../../services/assignments";
import { useAsyncData } from "../../hooks";
import type {
  Assignment,
  AssignmentListApiResponse,
} from "../../types/assignment";

const assignmentColumns = [
  { field: "userDni", headerName: "DNI Usuario", width: 90 },
  { field: "userName", headerName: "Usuario", width: 200 },
  { field: "vehiclePlate", headerName: "Patente", width: 120 },
  { field: "vehicleInfo", headerName: "Vehículo", width: 200 },
  { field: "formattedStartDate", headerName: "Fecha Inicio", width: 130 },
  { field: "formattedEndDate", headerName: "Fecha Fin", width: 130 },
  {
    field: "status",
    headerName: "Estado",
    width: 120,
    renderCell: (params: any) => {
      const isActive =
        !params.row?.endDate || new Date(params.row.endDate) > new Date();
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
          <h2 className="assignment-title">Gestión de Asignaciones</h2>
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

  const mappedAssignments =
    assignments?.map((assignment) => ({
      ...assignment,
      userDni: assignment.user?.dni ?? "",
      userName: assignment.user
        ? `${assignment.user.firstName ?? ""} ${
            assignment.user.lastName ?? ""
          }`.trim()
        : "",
      vehiclePlate: assignment.vehicle?.licensePlate ?? "",
      vehicleInfo: assignment.vehicle
        ? `${assignment.vehicle.brand ?? ""} ${
            assignment.vehicle.model ?? ""
          } (${assignment.vehicle.year ?? ""})`
        : "",
      formattedStartDate: assignment.startDate
        ? new Date(assignment.startDate).toLocaleDateString("es-ES")
        : "",
      formattedEndDate: assignment.endDate
        ? new Date(assignment.endDate).toLocaleDateString("es-ES")
        : "Indefinido",
    })) ?? [];

  return (
    <main className="assignment-container">
      <div className="assignment-header">
        <h1 className="title">Gestión de Asignaciones</h1>
      </div>
      <Table rows={mappedAssignments} columns={assignmentColumns} title="" />
    </main>
  );
}
