"use client";
import {
  DataGrid,
  type GridColDef,
  type GridValidRowModel,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useNavigate } from "react-router-dom";

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

interface GenericTableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  title: string;
  showEditColumn?: boolean;
  editRoute?: string;
}

export function Table<T extends GridValidRowModel>({
  rows,
  columns,
  title,
  showEditColumn = false,
  editRoute = "/useredit",
}: GenericTableProps<T>) {
  const navigate = useNavigate();

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
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            sortable: false,
            filterable: false,
            align: "center" as const,
            headerAlign: "center" as const,
            disableColumnMenu: true,
            renderCell: (params: any) => (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`${editRoute}?id=${params.row.id}`)}
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
      style={{
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "auto",
        width: "100%",
        maxWidth: "1400px",
      }}
    >
      <h2 style={{ textAlign: "start" }}>{title}</h2>
      <DataGrid
        rows={rows}
        columns={finalColumns}
        pageSizeOptions={[20, 50, 100]}
        showToolbar
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          backgroundColor: "#f2f2f2",
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f2f2f2",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
          borderRadius: 5,
          height: "80vh",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        autoHeight={false}
      />
    </div>
  );
}

export default Table;
