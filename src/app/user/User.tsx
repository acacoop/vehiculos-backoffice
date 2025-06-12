import Table from "../../components/Table/table";
import UserIconBlue from "../../assets/icons/user blue.svg";
import "./User.css";
import usersData from "../../data/user.json";
import { Chip } from "@mui/material";

const userColumns = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Nombre", width: 180 },
  { field: "email", headerName: "Email", width: 250 },
  {
    field: "active",
    headerName: "Usuario activo",
    width: 150,
    renderCell: (params: any) => (
      <Chip
        label={params.value ? "Activo" : "Inactivo"}
        color={params.value ? "success" : "error"}
        size="small"
        style={{ color: "#fff", fontWeight: 600 }}
      />
    ),
  },
  { field: "car", headerName: "Vehículo asignado", width: 180 },
];

export default function User() {
  return (
    <main className="user-container">
      <div className="user-header">
        <img src={UserIconBlue} alt="User Icon" className="user-icon" />
        <h1 className="user-title">Gestión de usuarios</h1>
      </div>
      <Table rows={usersData} columns={userColumns} title="" />
    </main>
  );
}
