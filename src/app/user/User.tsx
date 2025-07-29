import { Chip } from "@mui/material";
import Table from "../../components/Table/table";
import "./User.css";
import { getUsers } from "../../services/users";
import type { ServiceResponse } from "../../common";
import type { User as UserType } from "../../types/user";

const userColumns = [
  { field: "dni", headerName: "DNI", width: 120 },
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
  pagination: any
): Promise<ServiceResponse<UserType[]>> => {
  return await getUsers(
    { includeInactive: true },
    { page: pagination.page, limit: pagination.limit }
  );
};

export default function User() {
  return (
    <main className="user-container">
      <div className="user-header">
        <h1 className="title">Gestión de usuarios</h1>
      </div>
      <Table
        getRows={getUsersData}
        columns={userColumns}
        title=""
        showEditColumn={true}
        editRoute="/user/edit"
      />
    </main>
  );
}
