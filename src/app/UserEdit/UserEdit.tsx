import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import usersData from "../../data/user.json";
import "./UserEdit.css";

const mockDocuments = [
  { type: "DNI", file: "dni_juan.pdf" },
  { type: "Registro", file: "registro_juan.pdf" },
];

const mockReservas = [
  { id: 1, fecha: "2024-06-01", estado: "Finalizada" },
  { id: 2, fecha: "2024-06-10", estado: "Pendiente" },
];

const mockMantenimientos = [
  { id: 1, fecha: "2024-05-15", descripcion: "Cambio de aceite" },
  { id: 2, fecha: "2024-04-10", descripcion: "Revisión general" },
];

type UserType = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  car: string;
  role: string;
};

export default function UserEdit() {
  const [searchParams] = useSearchParams();
  const userId = Number(searchParams.get("id"));
  const user = (usersData as UserType[]).find((u) => u.id === userId);

  // Estado local para edición
  const [form, setForm] = useState<UserType>({
    id: user?.id ?? 0,
    name: user?.name ?? "",
    email: user?.email ?? "",
    active: user?.active ?? false,
    car: user?.car ?? "",
    role: user?.role ?? "usuario",
  });

  if (!user) {
    return (
      <main className="user-edit-container">
        <h1>Usuario no encontrado</h1>
      </main>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggleActive = () => {
    setForm((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleAddCar = () => {
    const nuevoAuto = prompt("Ingrese el modelo del nuevo vehículo:");
    if (nuevoAuto) setForm((prev) => ({ ...prev, car: nuevoAuto }));
  };

  return (
    <main
      className="user-edit-container"
      style={{ maxWidth: 700, margin: "auto", padding: 24 }}
    >
      <h1>Editar usuario</h1>
      <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Nombre:
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Email:
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Usuario activo:
          <input
            type="checkbox"
            name="active"
            checked={!!form.active}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={handleToggleActive}
            style={{ marginLeft: 8 }}
          >
            {form.active ? "Bloquear" : "Desbloquear"}
          </button>
        </label>
        <label>
          Vehículo asignado:
          <input name="car" value={form.car} onChange={handleChange} />
          <button
            type="button"
            onClick={handleAddCar}
            style={{ marginLeft: 8 }}
          >
            Agregar vehículo
          </button>
        </label>
        <label>
          Rol:
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="usuario">Usuario</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>
      </form>

      <hr style={{ margin: "24px 0" }} />

      <section>
        <h2>Documentos</h2>
        <ul>
          {mockDocuments.map((doc) => (
            <li key={doc.type}>
              {doc.type}: <a href="#">{doc.file}</a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Reservas</h2>
        <ul>
          {mockReservas.map((res) => (
            <li key={res.id}>
              {res.fecha} - {res.estado}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Historial de mantenimientos</h2>
        <ul>
          {mockMantenimientos.map((m) => (
            <li key={m.id}>
              {m.fecha} - {m.descripcion}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
