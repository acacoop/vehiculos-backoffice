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
    stroke="#1976d2"
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
}

export function Table<T extends GridValidRowModel>({
  rows,
  columns,
  title,
}: GenericTableProps<T>) {
  const navigate = useNavigate();

  const columnsWithEdit: GridColDef<T>[] = [
    ...columns.map((col) => ({
      ...col,
      flex: 1,
      minWidth: 120,
    })),
    {
      field: "edit",
      headerName: "Editar",
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/useredit?id=${params.row.id}`)}
        >
          <PencilIcon />
        </span>
      ),
    } as GridColDef<T>,
  ];

  return (
    <div
      style={{
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "auto",
      }}
    >
      <h2 style={{ textAlign: "start" }}>{title}</h2>
      <DataGrid
        rows={rows}
        columns={columnsWithEdit}
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
