import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/table";
import { getMaintenanceCategories } from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import type { PaginationParams } from "../../common";
import "./maintenances.css";

export default function MaintenancePage() {
  const navigate = useNavigate();

  // Definición de columnas para la tabla de mantenimientos
  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 250,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.row.id?.slice(0, 8) + "..." || "N/A",
    },
    {
      field: "name",
      headerName: "Nombre del Mantenimiento",
      width: 300,
      flex: 1,
      renderCell: (params) => params.row.name || "Sin nombre",
    },
  ];

  // Función para obtener mantenimientos para la tabla
  const getMaintenancesForTable = async (
    paginationParams: PaginationParams
  ) => {
    try {
      const response = await getMaintenanceCategories(paginationParams);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
          pagination: {
            page: paginationParams.page || 1,
            pageSize: paginationParams.limit || 20,
            total: response.data.length,
            pages: Math.ceil(
              response.data.length / (paginationParams.limit || 20)
            ),
          },
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
        message: `Error al obtener mantenimientos: ${
          (error as Error)?.message
        }`,
      };
    }
  };

  const handleCreateMaintenance = () => {
    navigate("/maintenance/create");
  };

  return (
    <div className="maintenances-container">
      <Table<Maintenance>
        getRows={getMaintenancesForTable}
        columns={maintenanceColumns}
        title=""
        showEditColumn={true}
        editRoute="/maintenance/edit"
        showTableHeader={true}
        headerTitle="Categorías de Mantenimiento"
        showAddButton={true}
        addButtonText="+ Nuevo Mantenimiento"
        onAddButtonClick={handleCreateMaintenance}
        maxWidth="900px"
      />
    </div>
  );
}
