import { useNavigate } from "react-router-dom";
import { Table } from "../../components/Table/table";
import type { TableColumn } from "../../components/Table/table";
import { getVehicleModels } from "../../services/vehicleModels";
import type { VehicleModel } from "../../types/vehicleModel";
import "./ModelsPage.css";

const columns: TableColumn<VehicleModel>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 200,
  },
  {
    field: "brand.name",
    headerName: "Marca",
    minWidth: 150,
  },
  {
    field: "vehicleType",
    headerName: "Tipo de Vehículo",
    minWidth: 150,
  },
];

export default function ModelsPage() {
  const navigate = useNavigate();

  return (
    <div className="models-page">
      <Table
        getRows={getVehicleModels}
        columns={columns}
        header={{
          title: "Modelos de Vehículos",
          addButton: {
            text: "+ Nuevo Modelo",
            onClick: () => navigate("/vehicles/models/new"),
          },
        }}
        actionColumn={{
          route: "/vehicles/models",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar modelos...",
        }}
      />
    </div>
  );
}
