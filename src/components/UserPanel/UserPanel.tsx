import { useState } from "react";
import "./UserPanel.css";

type UserType = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  car: string;
  role: string;
};

type Props = {
  user: UserType;
  setUser: (u: UserType) => void;
};

export default function UserPanel({ user, setUser }: Props) {
  const [estado, setEstado] = useState<"activo" | "bloqueado">(
    user.active ? "activo" : "bloqueado"
  );

  const handleBlock = () => {
    const nuevoEstado = estado === "activo" ? "bloqueado" : "activo";
    setEstado(nuevoEstado);
    setUser({ ...user, active: nuevoEstado === "activo" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = () => {
    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
    alert("Usuario guardado (simulado en localStorage)");
  };

  return (
    <div className="user-panel">
      <div className="user-panel-header">
        <div className="user-panel-info">
          <p>Nombre y apellido</p>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
          />
        </div>
        <div className="user-panel-info">
          <p>Email</p>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
          />
        </div>
        <div className="user-panel-role">
          <p>Estado</p>
          <select value={estado} disabled>
            <option value="activo">Usuario activo</option>
            <option value="bloqueado">Usuario bloqueado</option>
          </select>
          <button className="user-panel-block-button" onClick={handleBlock}>
            {estado === "activo" ? "Bloquear" : "Desbloquear"}
          </button>
        </div>
      </div>
      <button className="user-panel-save-button" onClick={handleSave}>
        Guardar
      </button>
    </div>
  );
}
