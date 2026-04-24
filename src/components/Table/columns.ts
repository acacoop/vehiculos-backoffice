import { Chip } from "@mui/material";
import type {
  GridColDef,
  GridValidRowModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  getNestedString,
  formatDate,
  formatDateTime,
  formatEndDate,
  formatRelativeDate,
} from "../../common";
import type { TableColumn } from "./types";
import { createElement } from "react";

export function createGridColumn<T extends GridValidRowModel>(
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
    sortable: column.sortable ?? false,
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

          return createElement(Chip, {
            label: transformedValue,
            color: boolValue ? "success" : "error",
            size: "small",
            sx: { color: "#fff", fontWeight: 600 },
          });
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
          `Column ${column.field} is type map but no map property provided`,
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

            return createElement(
              "span",
              { style: { color, fontWeight: 600 } },
              displayValue,
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

            return createElement(
              "span",
              { style: { color, fontWeight: 600 } },
              displayValue,
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
