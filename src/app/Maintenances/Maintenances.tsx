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
import "./Maintenances.css";

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
      field: "categoryName",
      headerName: "Nombre de Categoría",
      width: 250,
      flex: 1,
      renderCell: (params) => params.row.categoryName || "Sin categoría",
    },
    {
      field: "name",
      headerName: "Mantenimiento",
      width: 300,
      flex: 1,
      renderCell: (params) => params.row.name || "Sin nombre",
    },
  ];

const createTableDataHandler =
  (serviceCall: any, errorMessage: string) =>
  async (paginationParams: PaginationParams) => {
    try {
      const response = await serviceCall(paginationParams);

      if (!response.success) {
        return {
          success: false,
          data: [],
          message: response.message,
        };
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
        pagination: {
          page: paginationParams.page || 1,
          pageSize: paginationParams.limit || 20,
          total: response.data.length,
          pages: Math.ceil(
            response.data.length / (paginationParams.limit || 20),
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `${errorMessage}: ${(error as Error)?.message}`,
      };
    }
  };

const getMaintenancesForTable = createTableDataHandler(
  getMaintenanceCategories,
  "Error al obtener categorías",
);

const getPossibleMaintenancesForTable = createTableDataHandler(
  getMaintenancePossibles,
  "Error al obtener mantenimientos",
);

export default function MaintenancePage() {
  const navigate = useNavigate();

  return (
    <div className="maintenances-container">
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
        onAddButtonClick={() => navigate("/category/create")}
        maxWidth="900px"
      />

      <div style={{ padding: "40px 0" }} />

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
          onAddButtonClick={() => navigate("/maintenance/create")}
          maxWidth="900px"
          maxHeight="600px"
        />
      </div>
    </div>
  );
}
