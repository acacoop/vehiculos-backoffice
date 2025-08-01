import "./Assignment.css";
import Table from "../../components/Table/table";
import { getAssignments } from "../../services/assignments";
import type { Assignment } from "../../types/assignment";
import type { ServiceResponse, PaginationParams } from "../../common";
import { type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function Assignment() {
  const navigate = useNavigate();

  // Definir las columnas directamente sin useMemo para forzar recreación
  const assignmentColumns: GridColDef<Assignment>[] = [
    {
      field: "user.dni",
      headerName: "DNI Usuario",
      width: 90,
      renderCell: (params) =>
        params.row.user.dni?.toLocaleString() || "Sin DNI",
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
      field: "vehicle.info",
      headerName: "Vehículo",
      width: 200,
      valueGetter: (_, row) => {
        const vehicle = row.vehicle;
        return vehicle
          ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
          : "N/A";
      },
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
          try {
            const date = new Date(params.row.startDate);
            return date.toLocaleDateString("es-AR");
          } catch {
            return "Fecha inválida";
          }
        }
        return "Sin fecha";
      },
    },
    {
      field: "endDate",
      headerName: "Fecha Fin",
      width: 130,
      renderCell: (params) => {
        if (
          params.row.endDate &&
          params.row.endDate !== null &&
          params.row.endDate !== ""
        ) {
          try {
            const date = new Date(params.row.endDate);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString("es-AR");
            }
          } catch {
            return "Fecha inválida";
          }
        }
        return "Sin fecha fin";
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 100,
      valueGetter: (_, row) => {
        let isActive = true;
        if (row.endDate) {
          try {
            const endDate = new Date(row.endDate);
            const now = new Date();
            isActive = endDate > now;
          } catch {
            isActive = false;
          }
        }
        return isActive ? "Activa" : "Finalizada";
      },
      renderCell: (params) => {
        let isActive = true;
        if (params.row.endDate) {
          try {
            const endDate = new Date(params.row.endDate);
            const now = new Date();
            isActive = endDate > now;
          } catch {
            isActive = false;
          }
        }

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

  // Función para obtener asignaciones con paginación
  const getAssignmentsData = useMemo(
    () =>
      async (
        paginationParams: PaginationParams
      ): Promise<ServiceResponse<Assignment[]>> => {
        try {
          return await getAssignments({}, paginationParams);
        } catch (error) {
          return {
            success: false,
            data: [],
            message: `Error al obtener asignaciones: ${
              (error as Error)?.message || "Error desconocido"
            }`,
          };
        }
      },
    []
  );

  // Callback para agregar nueva asignación
  const handleAddButtonClick = () => navigate("/assignment/create");

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
        onAddButtonClick={handleAddButtonClick}
      />
    </main>
  );
}
