import { useEffect } from "react";
import { Chip, CircularProgress, Alert } from "@mui/material";
import Table from "../../components/Table/table";
import UserIconBlue from "../../assets/icons/user blue.svg";
import "./User.css";
import { useUserContext } from "../../contexts/UserContext";

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
  const { users, loading, error, refreshUsers } = useUserContext();

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  if (loading) {
    return (
      <main className="user-container">
        <div className="user-header">
          <h1 className="title">Gestión de usuarios</h1>
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
          <h1 className="title">Gestión de usuarios</h1>
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
        <h1 className="title">Gestión de usuarios</h1>
      </div>
      <Table rows={users || []} columns={userColumns} title="" />
    </main>
  );
}
