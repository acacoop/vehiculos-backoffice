import { Chip, CircularProgress, Alert } from "@mui/material";
import Table from "../../components/Table/table";
import UserIconBlue from "../../assets/icons/user blue.svg";
import "./User.css";
import { getUsers } from "../../services/users";
import { useAsyncData } from "../../hooks";
import type { User as UserType, UsersApiResponse } from "../../types/user";

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

export default function User() {
  const fetchUsersData = async (): Promise<UserType[]> => {
    const response: UsersApiResponse = await getUsers();
    console.log("Respuesta completa:", response);
    return response.data;
  };

  const { data: users, loading, error } = useAsyncData(fetchUsersData);

  if (loading) {
    return (
      <main className="user-container">
        <div className="user-header">
          <img src={UserIconBlue} alt="User Icon" className="user-icon" />
          <h1 className="user-title">Gestión de usuarios</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <CircularProgress />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="user-container">
        <div className="user-header">
          <img src={UserIconBlue} alt="User Icon" className="user-icon" />
          <h1 className="user-title">Gestión de usuarios</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  return (
    <main className="user-container">
      <div className="user-header">
        <img src={UserIconBlue} alt="User Icon" className="user-icon" />
        <h1 className="user-title">Gestión de usuarios</h1>
      </div>
      <Table rows={users || []} columns={userColumns} title="" />
    </main>
  );
}
