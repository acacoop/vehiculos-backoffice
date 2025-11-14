import { Table } from "../../components/Table/table";
import type { TableColumn } from "../../components/Table/table";
import { getUsers } from "../../services/users";
import type { User, UserFilterParams } from "../../types/user";

const userColumns: TableColumn<User>[] = [
  {
    field: "cuit",
    headerName: "CUIT",
    width: 120,
  },
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
  {
    field: "email",
    headerName: "Email",
    width: 300,
  },
  {
    field: "active",
    headerName: "Estado",
    width: 120,
    type: "boolean",
  },
];

export default function UsersPage() {
  return (
    <Table<UserFilterParams, User>
      getRows={getUsers}
      columns={userColumns}
      header={{
        title: "Gestión de Usuarios",
      }}
      actionColumn={{
        route: "/users",
        width: 80,
      }}
      search={{
        enabled: true,
        placeholder: "Buscar por nombre, apellido, email o CUIT",
      }}
      width={1200}
    />
  );
}
