import { type GridColDef } from "@mui/x-data-grid";
import Table from "../Table/table";
import { getUsers } from "../../services/users";
import type { User } from "../../types/user";
import "./UserAssignmentTable.css";

interface UserAssignmentTableProps {
  // Estado de usuarios asignados
  assignedUsers: Set<string>;
  assignedUserNames: Map<string, string>; // Nueva prop para mapear ID -> Nombre
  onUserAssign: (userId: string, userName: string) => void;

  // Props opcionales para personalizar el comportamiento
  title?: string;
  showAssignedInfo?: boolean;
  showSaveButton?: boolean;
  isSaving?: boolean;
  onSaveUsers?: () => void;

  // Props para personalizar el estilo
  width?: string;

  // Props para diferentes contextos
  context?: "registration" | "edit";
}

export default function UserAssignmentTable({
  assignedUsers,
  assignedUserNames,
  onUserAssign,
  title = "Usuarios",
  showAssignedInfo = true,
  showSaveButton = false,
  isSaving = false,
  onSaveUsers,
  width = "800px",
  context = "registration",
}: UserAssignmentTableProps) {
  // Definición de columnas para la tabla de usuarios
  const userColumns: GridColDef<User>[] = [
    {
      field: "dni",
      headerName: "DNI",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.value?.toLocaleString() || "Sin DNI",
    },
    { field: "lastName", headerName: "Apellido", flex: 1 },
    { field: "firstName", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Asignar",
      width: 100,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const isAssigned = assignedUsers.has(params.row.id);
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <button
              onClick={() => {
                const fullName = `${params.row.firstName} ${params.row.lastName}`;
                onUserAssign(params.row.id, fullName);
              }}
              style={{
                backgroundColor: isAssigned ? "#f44336" : "#FE9000",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                margin: "0",
                padding: "0",
                lineHeight: "1",
              }}
              title={
                isAssigned
                  ? `Remover ${params.row.firstName} ${params.row.lastName}`
                  : `Asignar ${params.row.firstName} ${params.row.lastName}`
              }
            >
              {isAssigned ? "−" : "+"}
            </button>
          </div>
        );
      },
    },
  ];

  // Función para obtener usuarios desde el servicio
  const getUsersForTable = async (pagination: {
    page: number;
    pageSize: number;
  }) => {
    const logPrefix =
      context === "edit" ? "[VEHICLE_EDIT]" : "[USER_ASSIGNMENT]";

    console.log(`🔍 ${logPrefix} Iniciando solicitud de usuarios...`);
    console.log(
      `📄 ${logPrefix} Parámetros de paginación recibidos:`,
      pagination
    );

    try {
      // Convertir pageSize a limit para coincidir con PaginationParams
      const paginationParams = {
        page: pagination.page,
        limit: pagination.pageSize,
      };

      console.log(
        `📤 ${logPrefix} Parámetros enviados al backend:`,
        paginationParams
      );
      console.log(`🌐 ${logPrefix} Llamando a getUsers...`);

      const response = await getUsers(
        { active: true }, // Solo usuarios activos
        paginationParams
      );

      console.log(`📨 ${logPrefix} Respuesta completa del backend:`, response);
      console.log(`📊 ${logPrefix} Tipo de respuesta:`, typeof response);
      console.log(`✅ ${logPrefix} Success:`, response.success);
      console.log(`📊 ${logPrefix} Data:`, response.data);
      console.log(`📊 ${logPrefix} Data length:`, response.data?.length);
      console.log(`📊 ${logPrefix} Data type:`, typeof response.data);
      console.log(`📊 ${logPrefix} Is array?`, Array.isArray(response.data));
      console.log(`💬 ${logPrefix} Message:`, response.message);

      if (response.success) {
        console.log(
          `🎉 ${logPrefix} Datos obtenidos exitosamente: ${
            response.data?.length || 0
          } registros`
        );
      } else {
        console.error(
          `❌ ${logPrefix} Error en la respuesta:`,
          response.message
        );
      }

      return response;
    } catch (error) {
      console.error(`💥 ${logPrefix} Error al obtener usuarios:`, error);
      console.error(`🔥 ${logPrefix} Stack trace:`, (error as Error)?.stack);

      // Retornar error estructurado con tipo correcto
      return {
        success: false,
        data: [],
        message: `⚠️ Error al obtener usuarios: ${(error as Error)?.message}`,
        error: error as any,
      };
    }
  };

  // Determinar el texto de información según el contexto
  const getInfoText = () => {
    if (context === "edit") {
      return "Usuarios actualmente asignados al vehículo";
    }
    return "Se asignarán automáticamente al registrar el vehículo";
  };

  return (
    <div className="user-assignment-table-container">
      {title && <h2 className="title">{title}</h2>}

      {/* Información de usuarios asignados */}
      {showAssignedInfo && assignedUsers.size > 0 && (
        <div className="assigned-info">
          <h3 className="assigned-title">👤 Usuarios Asignados</h3>
          <div className="assigned-description">{getInfoText()}</div>

          {/* Lista visual de usuarios asignados */}
          <div className="assigned-list">
            {Array.from(assignedUsers).map((userId) => (
              <div key={userId} className="assigned-item">
                <span className="assigned-item-icon">✓</span>
                <span className="assigned-item-name">
                  {assignedUserNames.get(userId) || `Usuario ${userId}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para guardar usuarios (solo en contexto de edición) */}
      {showSaveButton && assignedUsers.size > 0 && onSaveUsers && (
        <div className="save-button-container">
          <button
            onClick={onSaveUsers}
            disabled={isSaving}
            className={`save-button ${isSaving ? "saving" : ""}`}
          >
            {isSaving ? "Guardando..." : `Guardar Usuarios`}
          </button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="table-container" style={{ width, margin: "0 auto" }}>
        <Table<User>
          getRows={getUsersForTable}
          columns={userColumns}
          title=""
          showEditColumn={false}
        />
      </div>
    </div>
  );
}
