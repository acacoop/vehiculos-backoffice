import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid";
import EntityForm from "../../components/EntityForm/EntityForm";
import Document from "../../components/Document/Document";
import Table from "../../components/Table/table";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import { getVehicleById } from "../../services/vehicles";
import { getAssignments } from "../../services/assignments";
import type { Vehicle } from "../../types/vehicle";
import type { Assignment } from "../../types/assignment";
import type { PaginationParams } from "../../common";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicleId = id;

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
        if (params.row.startDate) {
          const date = new Date(params.row.startDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Sin fecha";
      },
    },
    {
      field: "endDate",
      headerName: "Fecha Hasta",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.endDate) {
          const date = new Date(params.row.endDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Activa";
      },
    },
  ];

  // Función para obtener asignaciones
  const getAssignmentsForTable = async (paginationParams: PaginationParams) => {
    try {
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

  // Cargar datos del vehículo
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError("ID de vehículo no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getVehicleById(vehicleId);
        if (response.success) {
          setVehicleData(response.data);
        } else {
          setError(response.message || "Error al cargar vehículo");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar vehículo"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  if (loading) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", margin: "2rem" }}
        >
          <CircularProgress />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  if (!vehicleData) {
    return (
      <main className="vehicle-edit-container">
        <div className="vehicle-edit-header">
          <h1 className="vehicle-edit-title">Editar vehículo</h1>
        </div>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          Vehículo no encontrado
        </Alert>
      </main>
    );
  }

  return (
    <main className="vehicle-edit-container">
      <div className="vehicle-state">
        <StatusToggle
          entityId={vehicleData.id}
          entityType="vehicle"
          active={true}
          onToggle={(newState: boolean) => {
            console.log("Vehículo actualizado:", newState);
          }}
        />
      </div>

      <div className="vehicle-edit-body">
        <EntityForm
          entityType="vehicle"
          entityId={vehicleData.id}
          data={vehicleData}
          onDataChange={(newData: Vehicle) => setVehicleData(newData)}
        />
      </div>

      <div className="vehicle-edit-body">
        <EntityForm
          entityType="technical"
          entityId={vehicleData.id}
          data={vehicleData}
          onDataChange={(newData: Vehicle) => setVehicleData(newData)}
        />
      </div>

      <div className="vehicle-edit-body">
        <Table<Assignment>
          getRows={getAssignmentsForTable}
          columns={assignmentColumns}
          title=""
          showEditColumn={true}
          editRoute="/assignment/edit"
          showTableHeader={true}
          headerTitle="Asignar Usuarios al Vehículo"
          showAddButton={true}
          addButtonText="+ Agregar Asignación"
          onAddButtonClick={() =>
            navigate(
              vehicleId
                ? `/assignment/create/${vehicleId}`
                : "/assignment/create"
            )
          }
          maxWidth="900px"
        />
      </div>

      <Document />
    </main>
  );
}
