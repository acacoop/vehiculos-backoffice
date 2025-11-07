import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getVehicles } from "../../../services/vehicles";
import type { Vehicle } from "../../../types/vehicle";

const columns: TableColumn<Vehicle>[] = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "model.brand.name", headerName: "Marca", flex: 1 },
  { field: "model.name", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

export default function VehiclesPage() {
  const navigate = useNavigate();

  return (
    <div className="vehicles-page">
      <Table
        getRows={getVehicles}
        columns={columns}
        header={{
          title: "Gestión de Vehículos",
          addButton: {
            text: "Comenzar Registro",
            onClick: () => navigate("/vehicles/new"),
          },
        }}
        actionColumn={{
          route: "/vehicles",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar Vehiculos...",
        }}
        width={1200}
      />
    </div>
  );
}
