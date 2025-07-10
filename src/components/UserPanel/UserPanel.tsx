import "./UserPanel.css";
import type { User } from "../../types/user";

type Props = {
  user: User;
  setUser?: (user: User) => void;
};

export default function UserPanel({ user }: Props) {
  return (
    <div className="user-panel">
      <div className="user-panel-header">
        <div className="user-panel-info">
          <p className="user-panel-label">ID</p>
          <input type="text" name="id" value={user.id} readOnly disabled />
        </div>
        <div className="user-panel-info">
          <p className="user-panel-label">Nombre</p>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            readOnly
            disabled
          />
        </div>
        <div className="user-panel-info">
          <p className="user-panel-label">Apellido</p>
          <input
            type="text"
            name="lastName"
            value={user.lastName}
            readOnly
            disabled
          />
        </div>
        <div className="user-panel-info">
          <p className="user-panel-label">Email</p>
          <input
            type="email"
            name="email"
            value={user.email}
            readOnly
            disabled
          />
        </div>
        <div className="user-panel-info">
          <p className="user-panel-label">DNI</p>
          <input type="text" name="dni" value={user.dni} readOnly disabled />
        </div>
      </div>
    </div>
  );
}
