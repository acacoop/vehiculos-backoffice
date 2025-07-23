import { type GridColDef } from "@mui/x-data-grid";
import Table from "../Table/table";
import { getMaintenanceCategories } from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import "./MaintenanceTable.css";

interface MaintenanceTableProps {
  // Estado de mantenimientos asignados
  assignedMaintenances: Set<string>;
  assignedMaintenanceNames: Map<string, string>; // Nueva prop para mapear ID -> Nombre
  onMaintenanceAssign: (maintenanceId: string, maintenanceName: string) => void;

  // Props opcionales para personalizar el comportamiento
  title?: string;
  showAssignedInfo?: boolean;
  showSaveButton?: boolean;
  isSaving?: boolean;
  onSaveMaintenances?: () => void;

  // Props para personalizar el estilo
  width?: string;

  // Props para diferentes contextos
  context?: "registration" | "edit";
}

export default function MaintenanceTable({
  assignedMaintenances,
  assignedMaintenanceNames,
  onMaintenanceAssign,
  title = "Mantenimientos",
  showAssignedInfo = true,
  showSaveButton = false,
  isSaving = false,
  onSaveMaintenances,
  width = "800px",
  context = "registration",
}: MaintenanceTableProps) {
  // Definición de columnas para la tabla de mantenimientos
  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      headerAlign: "center",
      align: "center",
    },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "actions",
      headerName: "Asignar",
      width: 100,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const isAssigned = assignedMaintenances.has(params.row.id.toString());
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
              onClick={() =>
                onMaintenanceAssign(params.row.id.toString(), params.row.name)
              }
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
                  ? `Remover ${params.row.name}`
                  : `Asignar ${params.row.name}`
              }
            >
              {isAssigned ? "−" : "+"}
            </button>
          </div>
        );
      },
    },
  ];

  // Función para obtener mantenimientos desde el servicio
  const getMaintenancesForTable = async (pagination: {
    page: number;
    pageSize: number;
  }) => {
    const logPrefix = context === "edit" ? "[VEHICLE_EDIT]" : "[MAINTENANCE]";

    console.log(`🔍 ${logPrefix} Iniciando solicitud de mantenimientos...`);
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
      console.log(`🌐 ${logPrefix} Llamando a getMaintenanceCategories...`);

      const response = await getMaintenanceCategories(paginationParams);

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
        console.warn(
          `🚧 ${logPrefix} Problema detectado: La tabla maintenance_category no existe en la BD`
        );
        console.info(
          `💡 ${logPrefix} Solución: Ejecutar CREATE TABLE maintenance_category...`
        );
      }

      return response;
    } catch (error) {
      console.error(`💥 ${logPrefix} Error al obtener mantenimientos:`, error);
      console.error(`🔥 ${logPrefix} Stack trace:`, (error as Error)?.stack);
      console.warn(
        `🚧 ${logPrefix} CAUSA PROBABLE: La tabla 'maintenance_category' no existe en la base de datos`
      );
      console.info(
        `💡 ${logPrefix} ACCIÓN REQUERIDA: Crear la tabla con el SQL proporcionado`
      );

      // Retornar error estructurado con tipo correcto
      return {
        success: false,
        data: [],
        message: `⚠️ TABLA NO EXISTE: maintenance_category. Error: ${
          (error as Error)?.message
        }`,
        error: error as any,
      };
    }
  };

  // Determinar el texto de información según el contexto
  const getInfoText = () => {
    if (context === "edit") {
      return "Mantenimientos actualmente asignados al vehículo";
    }
    return "Se asignarán automáticamente al registrar el vehículo";
  };

  return (
    <div className="maintenance-table-container">
      {title && <h2 className="title">{title}</h2>}

      {/* Información de mantenimientos asignados */}
      {showAssignedInfo && assignedMaintenances.size > 0 && (
        <div className="assigned-info">
          <h3 className="assigned-title">🔧 Mantenimientos Asignados</h3>
          <div className="assigned-description">{getInfoText()}</div>

          {/* Lista visual de mantenimientos asignados */}
          <div className="assigned-list">
            {Array.from(assignedMaintenances).map((maintenanceId) => (
              <div key={maintenanceId} className="assigned-item">
                <span className="assigned-item-icon">✓</span>
                <span className="assigned-item-name">
                  {assignedMaintenanceNames.get(maintenanceId) ||
                    `Mantenimiento ${maintenanceId}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para guardar mantenimientos (solo en contexto de edición) */}
      {showSaveButton &&
        assignedMaintenances.size > 0 &&
        onSaveMaintenances && (
          <div className="save-button-container">
            <button
              onClick={onSaveMaintenances}
              disabled={isSaving}
              className={`save-button ${isSaving ? "saving" : ""}`}
            >
              {isSaving ? "Guardando..." : `Guardar Mantenimientos`}
            </button>
          </div>
        )}

      {/* Tabla de mantenimientos */}
      <div className="table-container" style={{ width, margin: "0 auto" }}>
        <Table<Maintenance>
          getRows={getMaintenancesForTable}
          columns={maintenanceColumns}
          title=""
          showEditColumn={false}
        />
      </div>
    </div>
  );
}
