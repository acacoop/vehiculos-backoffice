import {
  DataGrid,
  type GridFilterModel,
  type GridColDef,
  type GridValidRowModel,
  type GridRenderCellParams,
  type GridSortModel,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FilterParams } from "../../types/common";
import { formatDate, COLORS } from "../../common";
import { ArrowRight, X } from "lucide-react";
import { createGridColumn } from "./columns";
import { FilterDropdown } from "./FilterDropdown";
import type { TableProps } from "./types";
import "./Table.css";

export function Table<
  TFilters extends FilterParams,
  T extends GridValidRowModel,
>({
  getRows,
  columns,
  header,
  actionColumn,
  search,
  filters,
  width,
  maxWidth = "1200px",
  maxHeight = "600px",
  minHeight,
}: TableProps<TFilters, T>) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Serializar searchParams para detectar cambios en la URL
  const searchParamsKey = searchParams.toString();

  // Leer filtros desde URL search params basándose en las definiciones de filtros
  const filtersFromUrl = useMemo((): Partial<TFilters> => {
    if (!filters?.definitions) return {};

    const urlFilters: Partial<TFilters> = {};

    for (const def of filters.definitions) {
      const paramValue = searchParams.get(String(def.field));
      if (paramValue) {
        (urlFilters as Record<string, string>)[String(def.field)] = paramValue;
      }
    }

    return urlFilters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.definitions, searchParamsKey]);

  // Estado interno de filtros (valores para enviar al backend)
  // Inicializar con los filtros de la URL si existen
  const [filterValues, setFilterValues] = useState<Partial<TFilters>>(() => {
    if (!filters?.definitions) return {};

    const urlFilters: Partial<TFilters> = {};
    for (const def of filters.definitions) {
      const paramValue = searchParams.get(String(def.field));
      if (paramValue) {
        (urlFilters as Record<string, string>)[String(def.field)] = paramValue;
      }
    }
    return urlFilters;
  });

  // Labels personalizados para mostrar en los chips (para filtros tipo search)
  const [filterDisplayLabels, setFilterDisplayLabels] = useState<
    Partial<Record<keyof TFilters, string>>
  >({});

  // Referencia para trackear la última URL procesada
  const lastProcessedUrlKey = useRef<string>(searchParamsKey);

  // Sincronizar filtros cuando cambia la URL (después del mount inicial)
  useEffect(() => {
    const syncFiltersFromUrl = async () => {
      if (!filters?.definitions) return;

      // Evitar procesar la misma URL dos veces
      if (lastProcessedUrlKey.current === searchParamsKey) return;
      lastProcessedUrlKey.current = searchParamsKey;

      // Si no hay filtros en la URL, limpiar
      if (Object.keys(filtersFromUrl).length === 0) {
        setFilterValues({});
        setFilterDisplayLabels({});
        return;
      }

      // Establecer los valores de los filtros
      setFilterValues(filtersFromUrl);

      // Resolver labels para filtros tipo search
      const labelsToResolve: Promise<{
        field: keyof TFilters;
        label: string;
      } | null>[] = [];

      for (const def of filters.definitions) {
        const paramValue = filtersFromUrl[def.field];
        if (paramValue && def.type === "search") {
          // Llamar a searchFn para obtener el label
          labelsToResolve.push(
            def
              .searchFn(String(paramValue))
              .then((results) => {
                const match = results.find(
                  (r) => r.value === String(paramValue),
                );
                if (match) {
                  return { field: def.field, label: match.label };
                }
                return null;
              })
              .catch(() => null),
          );
        }
      }

      if (labelsToResolve.length > 0) {
        const resolvedLabels = await Promise.all(labelsToResolve);
        const newLabels: Partial<Record<keyof TFilters, string>> = {};

        for (const result of resolvedLabels) {
          if (result) {
            newLabels[result.field] = result.label;
          }
        }

        setFilterDisplayLabels(newLabels);
      } else {
        setFilterDisplayLabels({});
      }
    };

    syncFiltersFromUrl();
  }, [filters?.definitions, filtersFromUrl, searchParamsKey]);

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

        // Clean filter values (remove empty/null/undefined)
        const cleanedFilters = filterValues
          ? (Object.fromEntries(
              Object.entries(filterValues).filter(
                ([, v]) => v !== undefined && v !== null && v !== "",
              ),
            ) as TFilters)
          : undefined;

        // Transform sortModel to backend sorting params
        const sortingParams =
          sortModel.length > 0
            ? {
                sortBy:
                  columns.find((col) => col.field === sortModel[0].field)
                    ?.sortField ?? sortModel[0].field,
                sortOrder: sortModel[0].sort ?? undefined,
              }
            : undefined;

        const response = await getRows({
          pagination: { limit: pageSize, offset },
          search:
            search?.enabled && normalizedSearch ? normalizedSearch : undefined,
          filters:
            cleanedFilters && Object.keys(cleanedFilters).length > 0
              ? cleanedFilters
              : undefined,
          sorting: sortingParams,
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
    [getRows, search?.enabled, filterValues, sortModel, columns],
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
    filterValues,
    sortModel,
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

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      // Reset to first page when sort changes
      if (paginationModel.page !== 0) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [paginationModel.page],
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
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
            onClick={() => {
              const id = actionColumn.idField
                ? params.row[actionColumn.idField]
                : params.row.id;
              navigate(`${actionColumn.route}/${id}`);
            }}
          >
            <ArrowRight size={20} color={COLORS.primary} />
          </span>
        ),
    };

    return [...baseColumns, actionCol];
  }, [columns, actionColumn, navigate]);

  const hasRows = rows.length > 0;

  // Calcular filtros activos para mostrar
  const activeFilters = useMemo(() => {
    if (!filters?.definitions) return [];

    return filters.definitions
      .filter((def) => {
        const value = filterValues[def.field];
        return value !== undefined && value !== null && value !== "";
      })
      .map((def) => {
        const rawValue = filterValues[def.field] as string;
        let displayValue = rawValue;

        // Check if we have a custom display label (for search filters)
        const customLabel = filterDisplayLabels[def.field];
        if (customLabel) {
          displayValue = customLabel;
        } else if (def.type === "select") {
          // Format display value based on filter type
          const option = def.options.find((o) => o.value === rawValue);
          displayValue = option?.label || rawValue;
        } else if (def.type === "boolean") {
          displayValue =
            rawValue === "true"
              ? def.trueLabel || "Sí"
              : def.falseLabel || "No";
        } else if (def.type === "date") {
          displayValue = formatDate(rawValue);
        }

        return {
          field: def.field,
          label: def.label,
          value: displayValue,
        };
      });
  }, [filters?.definitions, filterValues, filterDisplayLabels]);

  const hasActiveFilters = activeFilters.length > 0;
  const hasFilterConfig =
    filters && filters.definitions && filters.definitions.length > 0;

  // Handler para agregar un filtro
  const handleAddFilter = useCallback(
    (field: keyof TFilters, value: string, displayLabel?: string) => {
      setFilterValues((prev) => ({ ...prev, [field]: value }));
      // Save custom display label if provided
      if (displayLabel) {
        setFilterDisplayLabels((prev) => ({ ...prev, [field]: displayLabel }));
      } else {
        // Clear any existing custom label
        setFilterDisplayLabels((prev) => {
          const newLabels = { ...prev };
          delete newLabels[field];
          return newLabels;
        });
      }
      // Reset to first page when filters change
      if (paginationModel.page !== 0) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [paginationModel.page],
  );

  // Handler para remover un filtro específico
  const handleRemoveFilter = useCallback(
    (field: keyof TFilters) => {
      setFilterValues((prev) => {
        const newFilters = { ...prev };
        delete newFilters[field];
        return newFilters;
      });
      // Also remove display label
      setFilterDisplayLabels((prev) => {
        const newLabels = { ...prev };
        delete newLabels[field];
        return newLabels;
      });
      if (paginationModel.page !== 0) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [paginationModel.page],
  );

  // Handler para limpiar todos los filtros
  const handleClearFilters = useCallback(() => {
    setFilterValues({});
    setFilterDisplayLabels({});
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [paginationModel.page]);

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

      {/* Filters Bar */}
      {hasFilterConfig && (
        <div className="filters-container">
          <div className="filters-tag">
            {hasActiveFilters ? (
              <>
                <span className="filters-label">Filtros activos:</span>
                {activeFilters.map((filter) => (
                  <span
                    key={String(filter.field)}
                    className="filter-chip"
                    onClick={() => handleRemoveFilter(filter.field)}
                    title="Click para remover"
                  >
                    {filter.label}: {filter.value}
                    <X size={14} />
                  </span>
                ))}
              </>
            ) : (
              <span className="filters-label filters-label--empty">
                Sin filtros activos
              </span>
            )}
          </div>
          <div className="filters-actions">
            {hasActiveFilters && (
              <button
                className="filter-clear-btn"
                onClick={handleClearFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            )}
            <FilterDropdown
              definitions={filters.definitions}
              activeFilters={filterValues}
              onAddFilter={handleAddFilter}
            />
          </div>
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
            ? { height: maxHeight, maxHeight, minHeight: minHeight || "360px" }
            : {
                height: minHeight || "500px",
                minHeight: minHeight || "500px",
              }),
        }}
      >
        <DataGrid
          rows={rows}
          columns={finalColumns}
          getRowId={(row) => row.id}
          pagination
          paginationMode="server"
          filterMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
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
          showToolbar={search?.enabled || hasActiveFilters}
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
            backgroundColor: COLORS.background,
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: COLORS.background,
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: COLORS.white,
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
