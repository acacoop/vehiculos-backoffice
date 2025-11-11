import {
  DataGrid,
  type GridFilterModel,
  type GridColDef,
  type GridValidRowModel,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { esES } from "@mui/x-data-grid/locales";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiFindOptions } from "../../services/common";
import type { FilterParams, ServiceResponse } from "../../types/common";
import { PencilIcon } from "./icons";
import "./table.css";
import {
  getNestedString,
  formatDate,
  formatDateTime,
  formatEndDate,
  formatRelativeDate,
} from "../../common";

function createGridColumn<T extends GridValidRowModel>(
  column: TableColumn<T>,
): GridColDef<T> {
  const baseColumn: GridColDef<T> = {
    field: column.field,
    headerName: column.headerName,
    width: column.width,
    minWidth: column.minWidth ?? 150,
    flex: column.flex ?? 1,
    disableColumnMenu: true,
    disableReorder: true,
    sortable: false,
  };

  // Handle different column types
  switch (column.type) {
    case "boolean":
      return {
        ...baseColumn,
        renderCell: (params: GridRenderCellParams<T>) => {
          const rawValue = getNestedString(params.row, column.field);
          const boolValue =
            rawValue === "true" || rawValue === "1" || rawValue === "True";
          const transformedValue = column.transform
            ? column.transform(rawValue, params.row)
            : boolValue
            ? "Activo"
            : "Inactivo";

          return (
            <Chip
              label={transformedValue}
              color={boolValue ? "success" : "default"}
              size="small"
              sx={{ color: "#fff", fontWeight: 600 }}
            />
          );
        },
      };

    case "date":
      return {
        ...baseColumn,
        valueGetter: (_value, row) => {
          const rawValue = getNestedString(row, column.field);
          return formatDate(rawValue);
        },
      };

    case "datetime":
      return {
        ...baseColumn,
        valueGetter: (_value, row) => {
          const rawValue = getNestedString(row, column.field);
          return formatDateTime(rawValue);
        },
      };

    case "enddate":
      return {
        ...baseColumn,
        valueGetter: (_value, row) => {
          const rawValue = getNestedString(row, column.field);
          return formatEndDate(rawValue);
        },
      };

    case "relativedate":
      return {
        ...baseColumn,
        valueGetter: (_value, row) => {
          const rawValue = getNestedString(row, column.field);
          return formatRelativeDate(rawValue);
        },
      };

    default:
      // If color function is provided, use renderCell to apply styling
      if (column.color) {
        return {
          ...baseColumn,
          renderCell: (params: GridRenderCellParams<T>) => {
            const rawValue = getNestedString(params.row, column.field);
            const displayValue = column.transform
              ? column.transform(rawValue, params.row)
              : rawValue;
            const color = column.color!(rawValue, params.row);

            return (
              <span style={{ color, fontWeight: 600 }}>{displayValue}</span>
            );
          },
        };
      }

      return {
        ...baseColumn,
        valueGetter: (_value, row) => {
          const rawValue = getNestedString(row, column.field);
          return column.transform ? column.transform(rawValue, row) : rawValue;
        },
      };
  }
}

// ============ SIMPLIFIED COLUMN INTERFACE ============
export interface TableColumn<T extends GridValidRowModel> {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  type?: "text" | "boolean" | "date" | "datetime" | "enddate" | "relativedate";
  transform?: (value: string, row: T) => string;
  color?: (value: string, row: T) => string;
}

interface TableHeader {
  title: string;
  addButton?: {
    text: string;
    onClick: () => void;
  };
}

interface TableActionColumn<T extends GridValidRowModel> {
  route: string;
  width?: number;
  customRender?: (params: GridRenderCellParams<T>) => React.ReactNode;
}

interface TableSearch {
  enabled: boolean;
  placeholder?: string;
}

interface TableProps<
  TFilters extends FilterParams,
  T extends GridValidRowModel,
> {
  getRows(findOptions: ApiFindOptions<TFilters>): Promise<ServiceResponse<T[]>>;
  columns: TableColumn<T>[];

  header?: TableHeader;
  actionColumn?: TableActionColumn<T>;
  search?: TableSearch;

  width?: number | string;
  maxWidth?: string;
  maxHeight?: string;
}

export function Table<
  TFilters extends FilterParams,
  T extends GridValidRowModel,
>({
  getRows,
  columns,
  header,
  actionColumn,
  search,
  width,
  maxWidth = "1200px",
  maxHeight = "600px",
}: TableProps<TFilters, T>) {
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
    if (search?.placeholder) {
      return {
        ...esES.components.MuiDataGrid.defaultProps.localeText,
        toolbarQuickFilterPlaceholder: search.placeholder,
      };
    }
    return esES.components.MuiDataGrid.defaultProps.localeText;
  }, [search?.placeholder]);

  // Debounce search input
  useEffect(() => {
    if (!search?.enabled) {
      setSearchTerm("");
      setDebouncedSearch("");
      return;
    }

    const handler = setTimeout(() => {
      const trimmedValue = searchTerm.trim();
      setDebouncedSearch((current) =>
        current === trimmedValue ? current : trimmedValue,
      );
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, search?.enabled]);

  // Fetch data
  const fetchData = useCallback(
    async (page: number, pageSize: number, searchValue?: string) => {
      setLoading(true);
      try {
        // MUI uses 0-based pages, convert to offset for backend
        const offset = page * pageSize;
        const normalizedSearch = searchValue?.trim();
        const response = await getRows({
          pagination: { limit: pageSize, offset },
          search:
            search?.enabled && normalizedSearch ? normalizedSearch : undefined,
        });

        if (response.success) {
          setRows(response.data || []);
          setRowCount(response.pagination?.total || response.data?.length || 0);
        } else {
          setRows([]);
          setRowCount(0);
        }
      } catch {
        setRows([]);
        setRowCount(0);
      } finally {
        setLoading(false);
      }
    },
    [getRows, search?.enabled],
  );

  useEffect(() => {
    // Don't fetch while still debouncing search
    if (search?.enabled && searchTerm.trim() !== debouncedSearch.trim()) {
      return;
    }

    fetchData(
      paginationModel.page,
      paginationModel.pageSize,
      search?.enabled ? debouncedSearch : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    search?.enabled,
    debouncedSearch,
    fetchData,
  ]);

  const handlePaginationChange = useCallback(
    (model: { page: number; pageSize: number }) => {
      setPaginationModel((prev) =>
        prev.page === model.page && prev.pageSize === model.pageSize
          ? prev
          : model,
      );
    },
    [],
  );

  const handleFilterModelChange = useCallback(
    (model: GridFilterModel) => {
      if (!search?.enabled) return;

      const quickFilterValues = model.quickFilterValues || [];
      const normalizedSearch = quickFilterValues.join(" ").trim();

      if (normalizedSearch === searchTerm) return;

      setSearchTerm(normalizedSearch);

      if (paginationModel.page !== 0) {
        setPaginationModel({ ...paginationModel, page: 0 });
      }
    },
    [search?.enabled, searchTerm, paginationModel],
  );

  // Build final columns with action column if needed
  const finalColumns: GridColDef<T>[] = useMemo(() => {
    const baseColumns = columns.map((col) => createGridColumn(col));

    if (!actionColumn) return baseColumns;

    const actionCol: GridColDef<T> = {
      field: "actions",
      headerName: "Acciones",
      width: actionColumn.width ?? 100,
      minWidth: actionColumn.width ?? 100,
      maxWidth: actionColumn.width ?? 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      disableColumnMenu: true,
      disableReorder: true,
      renderCell: (params: GridRenderCellParams<T>) =>
        actionColumn.customRender ? (
          actionColumn.customRender(params)
        ) : (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`${actionColumn.route}/${params.row.id}`)}
          >
            <PencilIcon />
          </span>
        ),
    };

    return [...baseColumns, actionCol];
  }, [columns, actionColumn, navigate]);

  const hasRows = rows.length > 0;

  return (
    <div className="table-main-container" style={{ maxWidth, width }}>
      {header && (
        <div className="table-header">
          <h2 className="table-header-title">{header.title}</h2>
          {header.addButton && (
            <button
              className="table-add-btn"
              onClick={header.addButton.onClick}
            >
              {header.addButton.text}
            </button>
          )}
        </div>
      )}
      <div
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...(hasRows && maxHeight
            ? { height: maxHeight, maxHeight, minHeight: "360px" }
            : { minHeight: "240px" }),
        }}
      >
        <DataGrid
          rows={rows}
          columns={finalColumns}
          getRowId={(row) => row.id}
          pagination
          paginationMode="server"
          filterMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          onFilterModelChange={handleFilterModelChange}
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          showToolbar={search?.enabled}
          slotProps={{
            toolbar: search?.enabled
              ? {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 400 },
                }
              : undefined,
          }}
          localeText={localeText}
          style={{ flex: hasRows ? 1 : undefined }}
          sx={{
            backgroundColor: "#f2f2f2",
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f2f2f2",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
            borderRadius: 5,
            ...(hasRows && { height: "100%" }),
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "& .MuiDataGrid-virtualScroller": {
              overflowY: "auto",
            },
          }}
        />
      </div>
    </div>
  );
}
