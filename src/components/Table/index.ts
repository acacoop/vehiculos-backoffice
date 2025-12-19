// Re-export main component
export { Table } from "./Table";

// Re-export types for consumers
export type {
  // Filter types
  FilterDefinition,
  SelectFilterDefinition,
  TextFilterDefinition,
  NumberFilterDefinition,
  DateFilterDefinition,
  BooleanFilterDefinition,
  SearchFilterDefinition,
  // Table types
  TableColumn,
  TableHeader,
  TableActionColumn,
  TableSearch,
  TableFiltersConfig,
  TableProps,
} from "./types";

// Re-export utilities if needed externally
export { createGridColumn } from "./columns";
export { FilterDropdown } from "./FilterDropdown";
