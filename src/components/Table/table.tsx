"use client";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  type GridToolbarProps,
  type GridFilterModel,
  type GridColDef,
  type GridValidRowModel,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ServiceResponse, PaginationParams } from "../../common";
import "./table.css";

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#282D86"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export { PencilIcon };

const TableToolbar = (_props: GridToolbarProps) => (
  <GridToolbarContainer className="table-toolbar">
    <GridToolbarQuickFilter debounceMs={400} />
  </GridToolbarContainer>
);

interface GenericTableProps<T extends GridValidRowModel> {
  getRows(
    pagination: PaginationParams,
    options?: { search?: string }
  ): Promise<ServiceResponse<T[]>>;
  columns: GridColDef<T>[];
  title: string;
  showEditColumn?: boolean;
  editRoute?: string;
  additionalRouteParams?: string;
  customEditCell?: (params: any) => React.ReactNode;
  editColumnWidth?: number;

  showTableHeader?: boolean;
  headerTitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonRoute?: string;
  onAddButtonClick?: () => void;
  maxWidth?: string;
  containerClassName?: string;
  tableWidth?: string;
  maxHeight?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

export function Table<T extends GridValidRowModel>({
  getRows,
  columns,
  title,
  showEditColumn = false,
  editRoute = "/user/edit",
  additionalRouteParams = "",
  customEditCell,
  showTableHeader = false,
  headerTitle = "",
  showAddButton = false,
  addButtonText = "+ Agregar",
  addButtonRoute = "",
  onAddButtonClick,
  maxWidth = "1200px",
  containerClassName = "",
  tableWidth = "100%",
  maxHeight = "1200px",
  editColumnWidth = 150,
  enableSearch = false,
  searchPlaceholder,
}: GenericTableProps<T>) {
  const navigate = useNavigate();

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const localeText = useMemo(() => {
    if (searchPlaceholder) {
      return {
        ...esES.components.MuiDataGrid.defaultProps.localeText,
        toolbarQuickFilterPlaceholder: searchPlaceholder,
      };
    }
    return esES.components.MuiDataGrid.defaultProps.localeText;
  }, [searchPlaceholder]);

  useEffect(() => {
    if (!enableSearch) {
      setSearchTerm("");
      setDebouncedSearch("");
      return;
    }

    const handler = setTimeout(() => {
      const trimmedValue = searchTerm.trim();
      setDebouncedSearch((current) =>
        current === trimmedValue ? current : trimmedValue
      );
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, enableSearch]);

  const fetchData = async (
    page: number,
    pageSize: number,
    searchValue?: string
  ) => {
    setLoading(true);
    try {
      // MUI usa páginas base 0, pero el backend usa páginas base 1
      const normalizedSearch = searchValue?.trim();
      const response = await getRows(
        { page: page + 1, limit: pageSize },
        enableSearch
          ? { search: normalizedSearch ? normalizedSearch : undefined }
          : undefined
      );

      if (response.success) {
        setRows(response.data);

        // Actualizar información de paginación si está disponible
        if (response.pagination) {
          setRowCount(response.pagination.total);
        } else {
          setRowCount(response.data?.length || 0);
        }
      } else {
        setRows([]);
      }
    } catch (error) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(
      paginationModel.page,
      paginationModel.pageSize,
      enableSearch ? debouncedSearch : undefined
    );
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    enableSearch,
    debouncedSearch,
  ]);

  const handlePaginationChange = (model: any) => {
    setPaginationModel({
      page: model.page,
      pageSize: model.pageSize,
    });
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    if (!enableSearch) return;

    const quickFilterValues = model.quickFilterValues || [];
    const normalizedSearch = quickFilterValues.join(" ").trim();

    if (normalizedSearch === searchTerm) {
      return;
    }

    setSearchTerm(normalizedSearch);
    setPaginationModel((prev) =>
      prev.page === 0 ? prev : { ...prev, page: 0 }
    );
  };

  const handleAddButtonClick = () => {
    if (onAddButtonClick) {
      onAddButtonClick();
    } else if (addButtonRoute) {
      navigate(addButtonRoute);
    }
  };

  const finalColumns: GridColDef<T>[] = [
    ...columns.map((col) => ({
      ...col,
      flex: 1,
      minWidth: 150,
    })),

    ...(showEditColumn
      ? [
          {
            field: "edit",
            headerName: "Editar",
            width: editColumnWidth,
            minWidth: editColumnWidth,
            maxWidth: editColumnWidth,
            sortable: false,
            filterable: false,
            align: "center" as const,
            headerAlign: "center" as const,
            disableColumnMenu: true,
            renderCell: (params: any) =>
              customEditCell ? (
                customEditCell(params)
              ) : (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `${editRoute}/${params.row.id}${additionalRouteParams}`
                    )
                  }
                >
                  <PencilIcon />
                </span>
              ),
          } as GridColDef<T>,
        ]
      : []),
  ];

  return (
    <div
      className={`table-main-container ${containerClassName}`}
      style={{ maxWidth }}
    >
      {showTableHeader && (
        <div className="table-header">
          <h2 className="table-header-title">{headerTitle}</h2>
          {showAddButton && (
            <button className="table-add-btn" onClick={handleAddButtonClick}>
              {addButtonText}
            </button>
          )}
        </div>
      )}
      <div
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflow: "auto",
          width: tableWidth,
          maxWidth: "1400px",
          maxHeight,
        }}
      >
        <h2 style={{ textAlign: "start" }}>{title}</h2>
        <DataGrid
          rows={rows}
          columns={finalColumns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={{
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
          }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          onFilterModelChange={handleFilterModelChange}
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          slots={{ toolbar: TableToolbar }}
          showToolbar
          localeText={localeText}
          sx={{
            backgroundColor: "#f2f2f2",
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f2f2f2",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
            borderRadius: 5,
            height: "calc(100% - 60px)",
            minHeight: "400px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </div>
  );
}

export default Table;
