import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../components/Table/table";
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

// Definición de filtros disponibles
const filterDefinitions: FilterDefinition<UserFilterParams>[] = [
  {
    type: "boolean",
    field: "active",
    label: "Estado",
    trueLabel: "Activo",
    falseLabel: "Inactivo",
  },
];

export default function UsersPage() {
  return (
    <Table<UserFilterParams, User>
      getRows={getUsers}
      columns={userColumns}
      filters={{
        definitions: filterDefinitions,
      }}
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
