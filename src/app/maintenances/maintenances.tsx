import { type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/table";
import {
  getMaintenanceCategories,
  getMaintenancePossibles,
  type MaintenancePossibleNormalized,
} from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import type { PaginationParams } from "../../common";
import "./maintenances.css";

export default function MaintenancePage() {
  const navigate = useNavigate();

  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "name",
      headerName: "Categoría",
      width: 300,
      flex: 1,
      renderCell: (params) => params.row.name || "Sin nombre",
    },
  ];

  const possibleMaintenanceColumns: GridColDef<MaintenancePossibleNormalized>[] =
    [
      {
        field: "maintenanceCategoryName",
        headerName: "Nombre de Categoría",
        width: 250,
        flex: 1,
        renderCell: (params) =>
          params.row.maintenanceCategoryName || "Sin categoría",
      },
      {
        field: "name",
        headerName: "Mantenimiento",
        width: 300,
        flex: 1,
        renderCell: (params) => params.row.name || "Sin nombre",
      },
    ];

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
        message: `Error al obtener categorías: ${(error as Error)?.message}`,
      };
    }
  };

  const getPossibleMaintenancesForTable = async (
    paginationParams: PaginationParams
  ) => {
    try {
      const response = await getMaintenancePossibles(paginationParams);

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
    navigate("/category/create");
  };

  const handleCreatePossibleMaintenance = () => {
    navigate("/maintenance/create");
  };

  return (
    <div className="maintenances-container">
      {}
      <Table<Maintenance>
        getRows={getMaintenancesForTable}
        columns={maintenanceColumns}
        title=""
        showEditColumn={true}
        editRoute="/category/edit"
        showTableHeader={true}
        headerTitle="Categorías de Mantenimiento"
        showAddButton={true}
        addButtonText="+ Nueva Categoría"
        onAddButtonClick={handleCreateMaintenance}
        maxWidth="900px"
      />

      {}
      <div style={{ padding: "40px 0" }} />

      {}
      <div style={{ padding: "40px 0" }}>
        <Table<MaintenancePossibleNormalized>
          getRows={getPossibleMaintenancesForTable}
          columns={possibleMaintenanceColumns}
          title=""
          showEditColumn={true}
          editRoute="/maintenance/possible/edit"
          showTableHeader={true}
          headerTitle="Mantenimientos Posibles"
          showAddButton={true}
          addButtonText="+ Nuevo Mantenimiento"
          onAddButtonClick={handleCreatePossibleMaintenance}
          maxWidth="900px"
          maxHeight="600px"
        />
      </div>
    </div>
  );
}
