import { useSearchParams } from "react-router-dom";
import usersData from "../../data/user.json";
import UserPanel from "../../components/UserPanel/UserPanel";
import UserCarPanel from "../../components/UserCarPanel/UserCarPanel";
import { useState } from "react";
import DniLicense from "../../components/DniLicense/DniLicense";
import ReservePanel from "../../components/ReservePanel/ReservePanel";
import "./UserEdit.css";

type UserType = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  car: string;
  role: string;
  documents?: { type: string; file: string }[];
  reservas?: { id: number; fecha: string; estado: string }[];
  mantenimientos?: { id: number; fecha: string; descripcion: string }[];
};

export default function UserEdit() {
  const [searchParams] = useSearchParams();
  const userId = Number(searchParams.get("id"));
  const user = (usersData as UserType[]).find((u) => u.id === userId);
  const [userData, setUserData] = useState<UserType | undefined>(user);

  if (!userData) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <main className="user-edit-container">
      <div className="user-edit-header">
        <h1 className="user-edit-title">Editar usuario</h1>
      </div>
      <div className="user-edit-body">
        <UserPanel user={userData} setUser={setUserData} />
      </div>
      <div className="user-edit-body">
        <UserCarPanel />
      </div>
      <DniLicense />
      <ReservePanel />
    </main>
  );
}
