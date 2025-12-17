import {
  DataGrid,
  type GridFilterModel,
  type GridColDef,
  type GridValidRowModel,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { esES } from "@mui/x-data-grid/locales";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ApiFindOptions } from "../../services/common";
import type { FilterParams, ServiceResponse } from "../../types/common";
import {
  getNestedString,
  formatDate,
  formatDateTime,
  formatEndDate,
  formatRelativeDate,
  COLORS,
} from "../../common";
import "./table.css";
import { ArrowRight, X, ChevronDown, ChevronRight } from "lucide-react";

// ============ FILTER TYPES ============
interface BaseFilterDefinition<TFilters> {
  field: keyof TFilters;
  label: string;
}

export interface SelectFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "select";
  options: { label: string; value: string }[];
}

export interface TextFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "text";
  placeholder?: string;
}

export interface NumberFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "number";
  placeholder?: string;
}

export interface DateFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "date";
}

export interface BooleanFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "boolean";
  trueLabel?: string;
  falseLabel?: string;
}

export interface SearchFilterDefinition<TFilters>
  extends BaseFilterDefinition<TFilters> {
  type: "search";
  /** Función de búsqueda que retorna opciones filtradas */
  searchFn: (term: string) => Promise<{ label: string; value: string }[]>;
  placeholder?: string;
  /** Milisegundos de debounce (default: 300) */
  debounceMs?: number;
  /** Mínimo de caracteres para buscar (default: 1) */
  minChars?: number;
}

export type FilterDefinition<TFilters> =
  | SelectFilterDefinition<TFilters>
  | TextFilterDefinition<TFilters>
  | NumberFilterDefinition<TFilters>
  | DateFilterDefinition<TFilters>
  | BooleanFilterDefinition<TFilters>
  | SearchFilterDefinition<TFilters>;

// ============ FILTER DROPDOWN COMPONENT ============
interface FilterDropdownProps<TFilters extends FilterParams> {
  definitions: FilterDefinition<TFilters>[];
  activeFilters: Partial<TFilters>;
  onAddFilter: (
    field: keyof TFilters,
    value: string,
    displayLabel?: string
  ) => void;
}

function FilterDropdown<TFilters extends FilterParams>({
  definitions,
  activeFilters,
  onAddFilter,
}: FilterDropdownProps<TFilters>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterDefinition<TFilters> | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [filterLabel, setFilterLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { label: string; value: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const searchDebounceRef = useRef<number | undefined>(undefined);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedFilter(null);
        setFilterValue("");
        setFilterLabel("");
        setSearchTerm("");
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search filter effect
  useEffect(() => {
    if (selectedFilter?.type !== "search") return;

    const minChars = selectedFilter.minChars ?? 1;
    const debounceMs = selectedFilter.debounceMs ?? 300;

    if (searchTerm.length < minChars) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await selectedFilter.searchFn(searchTerm);
        setSearchResults(results);
        setShowSearchDropdown(true);
        setSelectedSearchIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm, selectedFilter]);

  // Get available filters (not already active)
  const availableFilters = definitions.filter(
    (def) =>
      activeFilters[def.field] === undefined ||
      activeFilters[def.field] === null ||
      activeFilters[def.field] === ""
  );

  const handleFilterSelect = (filter: FilterDefinition<TFilters>) => {
    setSelectedFilter(filter);
    setFilterValue("");
    setFilterLabel("");
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSelectedSearchIndex(-1);
  };

  const handleApplyFilter = () => {
    if (selectedFilter && filterValue) {
      onAddFilter(selectedFilter.field, filterValue, filterLabel || undefined);
      setSelectedFilter(null);
      setFilterValue("");
      setFilterLabel("");
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsOpen(false);
    }
  };

  const handleSearchResultSelect = (result: {
    label: string;
    value: string;
  }) => {
    setFilterValue(result.value);
    setFilterLabel(result.label);
    setSearchTerm(result.label);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown || searchResults.length === 0) {
      if (e.key === "Enter" && filterValue) {
        handleApplyFilter();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedSearchIndex >= 0 &&
        selectedSearchIndex < searchResults.length
      ) {
        handleSearchResultSelect(searchResults[selectedSearchIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filterValue) {
      handleApplyFilter();
    }
  };

  if (availableFilters.length === 0) return null;

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button
        className="filter-add-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        Agregar filtro
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          {!selectedFilter ? (
            // Step 1: Select filter type
            <div className="filter-dropdown-list">
              {availableFilters.map((filter) => (
                <button
                  key={String(filter.field)}
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect(filter)}
                  type="button"
                >
                  {filter.label} <ChevronRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            // Step 2: Enter filter value
            <div className="filter-value-input">
              <span className="filter-value-label">{selectedFilter.label}</span>

              {selectedFilter.type === "select" && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-input-field"
                  autoFocus
                >
                  <option value="">Seleccionar...</option>
                  {selectedFilter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {selectedFilter.type === "text" && (
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFilter.placeholder || "Escribir..."}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "number" && (
                <input
                  type="number"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFilter.placeholder || "Número..."}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "date" && (
                <input
                  type="date"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "boolean" && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-input-field"
                  autoFocus
                >
                  <option value="">Seleccionar...</option>
                  <option value="true">
                    {selectedFilter.trueLabel || "Sí"}
                  </option>
                  <option value="false">
                    {selectedFilter.falseLabel || "No"}
                  </option>
                </select>
              )}

              {selectedFilter.type === "search" && (
                <div className="filter-search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      // Clear selection if user types again
                      if (filterValue && e.target.value !== filterLabel) {
                        setFilterValue("");
                        setFilterLabel("");
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={selectedFilter.placeholder || "Buscar..."}
                    className="filter-input-field"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="filter-search-loading">Buscando...</div>
                  )}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div
                      className="filter-search-dropdown"
                      ref={searchResultsRef}
                    >
                      {searchResults.map((result, index) => (
                        <button
                          key={result.value}
                          className={`filter-search-item ${
                            index === selectedSearchIndex ? "selected" : ""
                          }`}
                          onClick={() => handleSearchResultSelect(result)}
                          type="button"
                        >
                          {result.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {showSearchDropdown &&
                    !isSearching &&
                    searchResults.length === 0 &&
                    searchTerm.length >= (selectedFilter.minChars ?? 1) && (
                      <div className="filter-search-dropdown">
                        <div className="filter-search-no-results">
                          No se encontraron resultados
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="filter-value-actions">
                <button
                  className="filter-cancel-btn"
                  onClick={() => {
                    setSelectedFilter(null);
                    setFilterValue("");
                    setFilterLabel("");
                    setSearchTerm("");
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="filter-apply-btn"
                  onClick={handleApplyFilter}
                  disabled={!filterValue}
                  type="button"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function createGridColumn<T extends GridValidRowModel>(
  column: TableColumn<T>
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
              color={boolValue ? "success" : "error"}
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

    case "map":
      if (!column.map) {
        throw new Error(
          `Column ${column.field} is type map but no map property provided`
        );
      }
      // If color function is provided, use renderCell to apply styling
      if (column.color) {
        return {
          ...baseColumn,
          renderCell: (params: GridRenderCellParams<T>) => {
            const rawValue = getNestedString(params.row, column.field);
            const displayValue =
              column.map![rawValue as keyof typeof column.map] ?? rawValue;
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
          return column.map![rawValue as keyof typeof column.map] ?? rawValue;
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
  type?:
    | "text"
    | "boolean"
    | "date"
    | "number"
    | "datetime"
    | "enddate"
    | "relativedate"
    | "map";
  transform?: (value: string, row: T) => string;
  color?: (value: string, row: T) => string;
  map?: Record<string, string>; // For map type: provides backend->UI label mapping
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

// ============ TABLE FILTERS CONFIG ============
export interface TableFiltersConfig<TFilters extends FilterParams> {
  /** Definiciones de filtros disponibles */
  definitions: FilterDefinition<TFilters>[];
}

interface TableProps<
  TFilters extends FilterParams,
  T extends GridValidRowModel
> {
  getRows(findOptions: ApiFindOptions<TFilters>): Promise<ServiceResponse<T[]>>;
  columns: TableColumn<T>[];

  header?: TableHeader;
  actionColumn?: TableActionColumn<T>;
  search?: TableSearch;
  filters?: TableFiltersConfig<TFilters>;

  width?: number | string;
  maxWidth?: string;
  maxHeight?: string;
  minHeight?: string;
}

export function Table<
  TFilters extends FilterParams,
  T extends GridValidRowModel
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
                  (r) => r.value === String(paramValue)
                );
                if (match) {
                  return { field: def.field, label: match.label };
                }
                return null;
              })
              .catch(() => null)
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
        current === trimmedValue ? current : trimmedValue
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
                ([, v]) => v !== undefined && v !== null && v !== ""
              )
            ) as TFilters)
          : undefined;

        const response = await getRows({
          pagination: { limit: pageSize, offset },
          search:
            search?.enabled && normalizedSearch ? normalizedSearch : undefined,
          filters:
            cleanedFilters && Object.keys(cleanedFilters).length > 0
              ? cleanedFilters
              : undefined,
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
    [getRows, search?.enabled, filterValues]
  );

  useEffect(() => {
    // Don't fetch while still debouncing search
    if (search?.enabled && searchTerm.trim() !== debouncedSearch.trim()) {
      return;
    }

    fetchData(
      paginationModel.page,
      paginationModel.pageSize,
      search?.enabled ? debouncedSearch : undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    search?.enabled,
    debouncedSearch,
    fetchData,
    filterValues,
  ]);

  const handlePaginationChange = useCallback(
    (model: { page: number; pageSize: number }) => {
      setPaginationModel((prev) =>
        prev.page === model.page && prev.pageSize === model.pageSize
          ? prev
          : model
      );
    },
    []
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
    [search?.enabled, searchTerm, paginationModel]
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
            onClick={() => navigate(`${actionColumn.route}/${params.row.id}`)}
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
    [paginationModel.page]
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
    [paginationModel.page]
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
