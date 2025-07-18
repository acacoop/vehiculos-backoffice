import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  return (
    <div className="vehicle-edit-container">
      <h2 className="title">Editar Vehículo</h2>
      <VehicleInfo />
      <TechnicalSheet />
    </div>
  );
}
