import { useNavigate } from "react-router-dom";
import "./AddVehicle.css";

export default function AddVehicle() {
  const navigate = useNavigate();

  const handleAddVehicle = () => {
    navigate("/vehicle/create");
  };

  return (
    <div>
      <div className="add-vehicle-container">
        <div className="add-vehicle-card">
          <h3>Registrar Nuevo Vehículo</h3>
          <p>Completa los datos del vehículo para añadirlo al sistema</p>
          <button className="add-vehicle-button" onClick={handleAddVehicle}>
            Comenzar Registro
          </button>
        </div>
      </div>
    </div>
  );
}
