import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import EntityForm from "../../components/EntityForm/EntityForm";
import Table from "../../components/Table/table";
import DniLicense from "../../components/DniLicense/DniLicense";
import StatusToggle from "../../components/StatusToggle/StatusToggle";
import { getUserById } from "../../services/users";
import { getAssignmentsByUser } from "../../services/assignments";
import { getReservationsByUser } from "../../services/reservations";
import { getVehicleById } from "../../services/vehicles";
import type { User } from "../../types/user";
import type { Assignment } from "../../types/assignment";
import type { PaginationParams } from "../../common";
import "./UserEdit.css";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id;
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return "Sin fecha";
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
        return "Activa";
      },
    },
  ];

  // Definición de columnas para la tabla de reservas
  const reservationColumns: GridColDef<any>[] = [
    {
      field: "vehicle",
      headerName: "Vehículo",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.vehicle) {
          return `${params.row.vehicle.brand} ${params.row.vehicle.model} (${params.row.vehicle.licensePlate})`;
        }
        return params.row.vehicleId || "N/A";
      },
    },
    {
      field: "startDate",
      headerName: "Fecha Inicio",
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
      headerName: "Fecha Fin",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.row.endDate) {
          const date = new Date(params.row.endDate);
          return date.toLocaleDateString("es-AR");
        }
        return "Sin fecha";
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (!params.row.startDate || !params.row.endDate) {
          return "Sin estado";
        }

        const now = new Date();
        const startDate = new Date(params.row.startDate);
        const endDate = new Date(params.row.endDate);

        if (now >= startDate && now <= endDate) {
          return (
            <span style={{ color: "#4caf50", fontWeight: "bold" }}>Activa</span>
          );
        } else if (now > endDate) {
          return (
            <span style={{ color: "#f44336", fontWeight: "bold" }}>
              Finalizada
            </span>
          );
        } else {
          return (
            <span style={{ color: "#ff9800", fontWeight: "bold" }}>
              Programada
            </span>
          );
        }
      },
    },
  ];

  // Función para obtener asignaciones del usuario
  const getAssignmentsForTable = async (paginationParams: PaginationParams) => {
    if (!userId) {
      return {
        success: false,
        data: [],
        message: "No se ha seleccionado ningún usuario",
      };
    }

    try {
      const response = await getAssignmentsByUser(userId, paginationParams);
      if (response.success) {
        return {
          success: true,
          data: response.data,
          total: response.data.length,
          message: response.message,
        };
      } else {
        return {
          success: false,
          data: [],
          total: 0,
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

  // Función para obtener reservas del usuario
  const getReservationsForTable = async (
    paginationParams: PaginationParams
  ) => {
    if (!userId) {
      return {
        success: false,
        data: [],
        message: "No se ha seleccionado ningún usuario",
      };
    }

    try {
      const response = await getReservationsByUser(userId, paginationParams);
      if (response.success) {
        // Enriquecer cada reserva con información completa del vehículo
        const enrichedReservations = await Promise.all(
          response.data.map(async (reservation: any) => {
            if (reservation.vehicleId && !reservation.vehicle) {
              try {
                const vehicleResponse = await getVehicleById(
                  reservation.vehicleId
                );
                if (vehicleResponse.success && vehicleResponse.data) {
                  return {
                    ...reservation,
                    vehicle: vehicleResponse.data,
                  };
                }
              } catch (error) {
                // Si no se puede obtener la información del vehículo, continuar sin ella
              }
            }
            return reservation;
          })
        );

        return {
          success: true,
          data: enrichedReservations,
          pagination: response.pagination,
          message: response.message,
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
        message: `Error al obtener reservas: ${(error as Error)?.message}`,
      };
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getUserById(userId);
        if (response.success) {
          setUserData(response.data);
        } else {
          setError(response.message || "Error al cargar usuario");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuario"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
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
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
        </div>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          Usuario no encontrado
        </Alert>
      </main>
    );
  }

  return (
    <main className="user-edit-container">
      <div className="user-state">
        <StatusToggle
          entityId={userData.id}
          entityType="user"
          active={userData.active ?? false}
          onToggle={(_newState: boolean) => {
            // Usuario actualizado
          }}
        />
      </div>

      <div className="user-edit-body">
        <EntityForm
          entityType="user"
          entityId={userData.id}
          data={userData}
          onDataChange={(newData: User) => setUserData(newData)}
        />
      </div>

      <div className="user-edit-body">
        <Table<Assignment>
          getRows={getAssignmentsForTable}
          columns={vehicleColumns}
          title=""
          showEditColumn={true}
          editRoute="/assignment/edit"
          showTableHeader={true}
          headerTitle={`Vehículos Asignados${
            userData ? ` a ${userData.firstName} ${userData.lastName}` : ""
          }`}
          showAddButton={true}
          addButtonText="+ Agregar Vehículo"
          onAddButtonClick={() =>
            navigate(`/assignment/create?userId=${userId}`)
          }
          maxWidth="900px"
        />
      </div>

      <div className="user-edit-body">
        <Table<any>
          getRows={getReservationsForTable}
          columns={reservationColumns}
          title=""
          showEditColumn={false}
          showTableHeader={true}
          headerTitle={`Reservas de Vehículos${
            userData ? ` de ${userData.firstName} ${userData.lastName}` : ""
          }`}
          showAddButton={true}
          addButtonText="+ Nueva Reserva"
          onAddButtonClick={() =>
            navigate(`/reservations/create?userId=${userId}`)
          }
          maxWidth="900px"
        />
      </div>

      <DniLicense />
    </main>
  );
}
