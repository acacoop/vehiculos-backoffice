import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  return (
    <div className="vehicle-edit-container">
      <h2 className="title">Editar Vehículo</h2>
      <VehicleInfo />
    </div>
  );
}
