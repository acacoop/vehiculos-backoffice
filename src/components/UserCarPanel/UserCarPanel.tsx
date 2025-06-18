import { useEffect, useState } from "react";
import usersData from "../../data/user.json";
import "./UserCarPanel.css";

const ACTIVE_USER_ID = 1;

type CarType = {
  name: string;
  patente: string;
};

type UserType = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  car: string;
  patente?: string;
  role: string;
  cars?: CarType[];
};

export default function UserCarPanel() {
  // Buscar usuario activo
  const user: UserType | undefined = (usersData as UserType[]).find(
    (u) => u.id === ACTIVE_USER_ID
  );

  // Inicializar autos asignados desde user.json (si tiene cars, sino usar el campo car)
  const initialCars: CarType[] =
    user?.cars && user.cars.length > 0
      ? user.cars
      : user?.car
      ? [{ name: user.car, patente: user.patente || "" }]
      : [];

  const [assignedCars, setAssignedCars] = useState<CarType[]>(initialCars);
  const [newCarName, setNewCarName] = useState<string>("");
  const [newCarPatente, setNewCarPatente] = useState<string>("");

  // Si el usuario cambia, actualizar la lista de autos asignados
  useEffect(() => {
    setAssignedCars(initialCars);
  }, [user?.id]);

  const handleAddCar = () => {
    if (newCarName.trim() && newCarPatente.trim()) {
      setAssignedCars([
        ...assignedCars,
        { name: newCarName.trim(), patente: newCarPatente.trim() },
      ]);
      setNewCarName("");
      setNewCarPatente("");
    }
  };

  const handleRemoveCar = (index: number) => {
    setAssignedCars(assignedCars.filter((_, i) => i !== index));
  };

  return (
    <div className="user-car-panel-container">
      <label className="user-car-panel-title">Vehículos asignados</label>
      <ul className="user-car-panel-list">
        {assignedCars.length === 0 && (
          <li className="user-car-panel-empty">Sin vehículos asignados</li>
        )}
        {assignedCars.map((car, idx) => (
          <li key={idx} className="user-car-panel-list-item">
            <span>
              {car.name}{" "}
              <span className="user-car-panel-patente">{car.patente}</span>
            </span>
            <button
              className="user-car-panel-remove-btn"
              onClick={() => handleRemoveCar(idx)}
              title="Quitar vehículo"
            >
              -
            </button>
          </li>
        ))}
      </ul>
      <div className="user-car-panel-row">
        <input
          type="text"
          placeholder="Nuevo vehículo"
          value={newCarName}
          onChange={(e) => setNewCarName(e.target.value)}
          className="user-car-panel-new-input"
        />
        <input
          type="text"
          placeholder="Patente"
          value={newCarPatente}
          onChange={(e) => setNewCarPatente(e.target.value)}
          className="user-car-panel-new-input"
          style={{ maxWidth: 100 }}
        />
        <button
          onClick={handleAddCar}
          className="user-car-panel-plus-btn"
          title="Asignar vehículo"
          disabled={!newCarName.trim() || !newCarPatente.trim()}
        >
          +
        </button>
      </div>
    </div>
  );
}
