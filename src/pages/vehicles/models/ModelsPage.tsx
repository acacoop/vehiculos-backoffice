import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../../components/Table";
import { getVehicleModels } from "../../../services/vehicleModels";
import { getVehicleBrands } from "../../../services/vehicleBrands";
import type {
  VehicleModel,
  VehicleModelFilterParams,
} from "../../../types/vehicleModel";
import type { VehicleBrand } from "../../../types/vehicleBrand";
import { ROUTES } from "../../../common";

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
    headerName: "Tipo de vehículo",
    minWidth: 150,
  },
];

export default function ModelsPage() {
  const navigate = useNavigate();
  const [brandOptions, setBrandOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Cargar marcas para el filtro select
  useEffect(() => {
    const loadBrands = async () => {
      const response = await getVehicleBrands();
      if (response.success && response.data) {
        setBrandOptions(
          response.data.map((brand: VehicleBrand) => ({
            label: brand.name,
            value: brand.id,
          })),
        );
      }
    };
    loadBrands();
  }, []);

  const filterDefinitions: FilterDefinition<VehicleModelFilterParams>[] = [
    {
      type: "select",
      field: "brandId",
      label: "Marca",
      options: brandOptions,
    },
  ];

  return (
    <div className="container">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: ROUTES.HOME },
          { label: "Modelos" },
        ]}
      />
      <Table<VehicleModelFilterParams, VehicleModel>
        getRows={getVehicleModels}
        columns={columns}
        filters={{
          definitions: filterDefinitions,
        }}
        header={{
          title: "Modelos de vehículos",
          addButton: {
            text: "+ Nuevo modelo",
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
        width={1200}
      />
    </div>
  );
}
