import { useState } from "react";
import "./UserCarPanel.css";

export default function UserCarPanel() {
  const [assignedCar, setAssignedCar] = useState<string>("");
  const [newCar, setNewCar] = useState<string>("");

  const handleAddCar = () => {
    if (newCar.trim()) {
      setAssignedCar(newCar.trim());
      setNewCar("");
    }
  };

  return (
    <div className="user-car-panel-container">
      <label className="user-car-panel-title">Vehículo asignado</label>
      <input
        type="text"
        value={assignedCar}
        readOnly
        className="user-car-panel-input"
      />
      <div className="user-car-panel-row">
        <input
          type="text"
          placeholder="Nuevo vehículo"
          value={newCar}
          onChange={(e) => setNewCar(e.target.value)}
          className="user-car-panel-new-input"
        />
        <button
          onClick={handleAddCar}
          className="user-car-panel-plus-btn"
          title="Asignar vehículo"
        >
          +
        </button>
      </div>
      <button
        className="user-car-panel-add-btn"
        onClick={handleAddCar}
        disabled={!newCar.trim()}
      >
        Agregar Vehículo
      </button>
    </div>
  );
}
