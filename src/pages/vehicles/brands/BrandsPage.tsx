import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { getVehicleBrands } from "../../../services/vehicleBrands";
import type { VehicleBrand } from "../../../types/vehicleBrand";

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
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: "/" },
          { label: "Marcas" },
        ]}
      />
      <Table
        getRows={getVehicleBrands}
        columns={columns}
        header={{
          title: "Marcas de vehículos",
          addButton: {
            text: "+ Nueva marca",
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
        width={1200}
      />
    </div>
  );
}
