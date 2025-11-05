import { useNavigate } from "react-router-dom";
import { Table } from "../../components/Table/table";
import type { TableColumn } from "../../components/Table/table";
import { getVehicleBrands } from "../../services/vehicleBrands";
import type { VehicleBrand } from "../../types/vehicleBrand";
import "./BrandsPage.css";

const columns: TableColumn<VehicleBrand>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 250,
  },
];

export default function BrandsPage() {
  const navigate = useNavigate();

  return (
    <div className="brands-page">
      <Table
        getRows={getVehicleBrands}
        columns={columns}
        header={{
          title: "Marcas de Vehículos",
          addButton: {
            text: "+ Nueva Marca",
            onClick: () => navigate("/vehicles/brands/new"),
          },
        }}
        actionColumn={{
          route: "/vehicles/brands",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar marcas...",
        }}
      />
    </div>
  );
}
