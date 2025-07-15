import { Table } from "../Table/table";
import { getAssignmentsByUser } from "../../services/assignments";
import type { ServiceResponse, PaginationParams } from "../../common";
import type { User } from "../../types/user";
import "./UserCarPanel.css";

interface UserCarPanelProps {
  userId: string;
  user: User;
}

export default function UserCarPanel({ userId, user }: UserCarPanelProps) {
  // Función para obtener asignaciones con paginación
  const getAssignmentsData = async (
    pagination: PaginationParams
  ): Promise<ServiceResponse<any[]>> => {
    if (!userId) {
      return {
        success: true,
        data: [],
      };
    }

    try {
      const response = await getAssignmentsByUser(userId, pagination);

      console.log("🚗 UserCarPanel - Respuesta de asignaciones:", response);

      if (response.success) {
        // Mapear los datos para la tabla
        const mappedData = response.data.map(
          (assignment: any, index: number) => {
            const vehicle = assignment.vehicle;

            const mappedItem = {
              id: assignment.id || `assignment-${Date.now()}-${index}`, // Asegurar que siempre haya un ID único
              licensePlate: vehicle?.licensePlate || "N/A",
              brand: vehicle?.brand || "N/A",
              model: vehicle?.model || "N/A",
              year: vehicle?.year?.toString() || "N/A",
              startDate: assignment.startDate || "N/A",
              endDate: assignment.endDate || "Sin fecha",
              active: Boolean(assignment.active),
              imageUrl: vehicle?.imageUrl || "",
            };

            console.log("🔄 UserCarPanel - Item mapeado:", mappedItem);
            return mappedItem;
          }
        );

        console.log("✅ UserCarPanel - Datos finales mapeados:", mappedData);

        return {
          success: true,
          data: mappedData,
          pagination: response.pagination,
        };
      } else {
        console.error(
          "❌ UserCarPanel - Error en respuesta:",
          response.message
        );
        return {
          success: false,
          data: [],
          message: response.message,
        };
      }
    } catch (error) {
      console.error("❌ UserCarPanel - Error al cargar asignaciones:", error);
      return {
        success: false,
        data: [],
        message: "Error al cargar asignaciones",
      };
    }
  };

  const columns = [
    { field: "licensePlate", headerName: "Patente", flex: 1 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1 },
    { field: "year", headerName: "Año", flex: 1 },
    {
      field: "startDate",
      headerName: "Asignado desde",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value && params.value !== "N/A") {
          const date = new Date(params.value);
          return date.toLocaleDateString("es-AR");
        }
        return params.value;
      },
    },
    {
      field: "endDate",
      headerName: "Hasta",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value && params.value !== "Sin fecha") {
          const date = new Date(params.value);
          return date.toLocaleDateString("es-AR");
        }
        return params.value;
      },
    },
    {
      field: "active",
      headerName: "Activo",
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            color: params.value ? "#4caf50" : "#f44336",
            fontWeight: "bold",
          }}
        >
          {params.value ? "Sí" : "No"}
        </span>
      ),
    },
  ];

  if (!userId) {
    return (
      <div
        className="user-car-panel-container"
        style={{ width: 860, margin: "0 auto" }}
      >
        <label className="user-car-panel-title">Vehículos asignados</label>
        <div style={{ textAlign: "center", color: "#666", marginTop: 16 }}>
          No se ha seleccionado ningún usuario
        </div>
      </div>
    );
  }

  return (
    <div
      className="user-car-panel-container"
      style={{ width: 860, margin: "0 auto" }}
    >
      <label className="user-car-panel-title">
        Vehículos asignados {user ? `a ${user.firstName} ${user.lastName}` : ""}
      </label>
      <div style={{ width: "100%" }}>
        <Table
          getRows={getAssignmentsData}
          columns={columns}
          title=""
          showEditColumn={false}
        />
      </div>
    </div>
  );
}
