import { useNavigate } from "react-router-dom";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../../components/Table/table";
import { getVehicles } from "../../../services/vehicles";
import { getVehicleBrands } from "../../../services/vehicleBrands";
import { FUEL_TYPE_OPTIONS } from "../../../common";
import type { Vehicle, VehicleFilterParams } from "../../../types/vehicle";

const columns: TableColumn<Vehicle>[] = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "model.brand.name", headerName: "Marca", flex: 1 },
  { field: "model.name", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

// Función de búsqueda para el filtro de marcas
const searchBrands = async (
  term: string
): Promise<{ label: string; value: string }[]> => {
  const response = await getVehicleBrands({ search: term });
  if (response.success && response.data) {
    return response.data.map((brand) => ({
      label: brand.name,
      value: brand.id,
    }));
  }
  return [];
};

export default function VehiclesPage() {
  const navigate = useNavigate();

  const filterDefinitions: FilterDefinition<VehicleFilterParams>[] = [
    {
      type: "search",
      field: "brandId",
      label: "Marca",
      searchFn: searchBrands,
      placeholder: "Buscar marca...",
      minChars: 1,
    },
    {
      type: "select",
      field: "fuelType",
      label: "Combustible",
      options: FUEL_TYPE_OPTIONS,
    },
    {
      type: "number",
      field: "minYear",
      label: "Año desde",
      placeholder: "Ej: 2020",
    },
    {
      type: "number",
      field: "maxYear",
      label: "Año hasta",
      placeholder: "Ej: 2024",
    },
    {
      type: "number",
      field: "minKilometers",
      label: "Km desde",
      placeholder: "Ej: 0",
    },
    {
      type: "number",
      field: "maxKilometers",
      label: "Km hasta",
      placeholder: "Ej: 100000",
    },
  ];

  return (
    <div className="container">
      <Table<VehicleFilterParams, Vehicle>
        getRows={getVehicles}
        columns={columns}
        filters={{
          definitions: filterDefinitions,
        }}
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
        maxHeight="600px"
        width="1200px"
      />
    </div>
  );
}
