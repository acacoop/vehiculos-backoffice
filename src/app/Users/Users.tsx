import { Chip } from "@mui/material";
import Table from "../../components/Table/table";
import "./Users.css";
import { getUsers } from "../../services/users";
import type { ServiceResponse, PaginationParams } from "../../common";
import type { User as UserType, UserFilterParams } from "../../types/user";

const userColumns = [
  { field: "cuit", headerName: "CUIT", width: 120 },
  {
    field: "firstName",
    headerName: "Nombre",
    width: 150,
  },
  {
    field: "lastName",
    headerName: "Apellido",
    width: 150,
  },
  { field: "email", headerName: "Email", width: 300 },
  {
    field: "active",
    headerName: "Estado",
    width: 120,
    renderCell: (params: any) => (
      <Chip
        label={params.value ? "Activo" : "Inactivo"}
        color={params.value ? "success" : "error"}
        size="small"
        style={{ color: "#fff", fontWeight: 600 }}
      />
    ),
  },
];

const getUsersData = async (
  pagination: PaginationParams,
  options?: { search?: string }
): Promise<ServiceResponse<UserType[]>> => {
  const filters: UserFilterParams & { includeInactive?: boolean } = {
    includeInactive: true,
  };

  if (options?.search) {
    filters.search = options.search.trim();
  }

  return await getUsers(filters, {
    page: pagination.page,
    limit: pagination.limit,
  });
};

export default function Users() {
  return (
    <main className="users-container">
      <Table
        showTableHeader={true}
        headerTitle="Gestión de Usuarios"
        getRows={getUsersData}
        columns={userColumns}
        title=""
        showEditColumn={true}
        editRoute="/user/edit"
        maxHeight="900px"
        enableSearch
        searchPlaceholder="Buscar por nombre, apellido, email o CUIT"
      />
    </main>
  );
}
