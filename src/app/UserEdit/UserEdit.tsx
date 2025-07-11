import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import UserPanel from "../../components/UserPanel/UserPanel";
import UserCarPanel from "../../components/UserCarPanel/UserCarPanel";
import DniLicense from "../../components/DniLicense/DniLicense";
import ReservePanel from "../../components/ReservePanel/ReservePanel";
import UserState from "../../components/UserState/UserState";
import { getUserById } from "../../services/users";
import type { User } from "../../types/user";
import "./UserEdit.css";

export default function UserEdit() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = await getUserById(userId);
        setUserData(user);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuario"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
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
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
        </div>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="user-edit-container">
        <div className="user-edit-header">
          <h1 className="user-edit-title">Editar usuario</h1>
        </div>
        <Alert severity="warning" style={{ margin: "2rem" }}>
          Usuario no encontrado
        </Alert>
      </main>
    );
  }

  return (
    <main className="user-edit-container">
      <div className="user-edit-header">
        <h1 className="user-edit-title">Editar usuario</h1>
      </div>
      <div className="user-edit-body">
        <UserPanel user={userData} setUser={setUserData} />
      </div>
      <div className="user-state">
        <UserState
          userId={userData.id}
          active={userData.active ?? false}
          onToggle={(newState) => {
            console.log("Usuario actualizado:", newState);
          }}
        />
      </div>
      <div className="user-edit-body">
        <UserCarPanel />
      </div>
      <DniLicense />
      <ReservePanel />
    </main>
  );
}
