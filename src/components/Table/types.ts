import type { GridValidRowModel, GridRenderCellParams } from "@mui/x-data-grid";
import type { ApiFindOptions } from "../../services/common";
import type { FilterParams, ServiceResponse } from "../../types/common";

// ============ FILTER TYPES ============
interface BaseFilterDefinition<TFilters> {
  field: keyof TFilters;
  label: string;
}

export interface SelectFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
  type: "select";
  options: { label: string; value: string }[];
}

export interface TextFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
  type: "text";
  placeholder?: string;
}

export interface NumberFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
  type: "number";
  placeholder?: string;
}

export interface DateFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
  type: "date";
}

export interface BooleanFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
  type: "boolean";
  trueLabel?: string;
  falseLabel?: string;
}

export interface SearchFilterDefinition<
  TFilters,
> extends BaseFilterDefinition<TFilters> {
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

// ============ COLUMN TYPES ============
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
  sortable?: boolean;
  sortField?: string; // Backend field name for sorting (defaults to field)
}

// ============ TABLE CONFIG TYPES ============
export interface TableHeader {
  title: string;
  addButton?: {
    text: string;
    onClick: () => void;
  };
}

export interface TableActionColumn<T extends GridValidRowModel> {
  route: string;
  width?: number;
  idField?: keyof T;
  customRender?: (params: GridRenderCellParams<T>) => React.ReactNode;
}

export interface TableSearch {
  enabled: boolean;
  placeholder?: string;
}

export interface TableFiltersConfig<TFilters extends FilterParams> {
  /** Definiciones de filtros disponibles */
  definitions: FilterDefinition<TFilters>[];
}

export interface TableProps<
  TFilters extends FilterParams,
  T extends GridValidRowModel,
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
