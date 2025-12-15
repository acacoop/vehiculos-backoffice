import { useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getVehicles, type VehicleFilters } from "../../../services/vehicles";
import type { Vehicle } from "../../../types/vehicle";

const columns: TableColumn<Vehicle>[] = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "model.brand.name", headerName: "Marca", flex: 1 },
  { field: "model.name", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

const FILTER_LABELS = [
  {
    key: "minKilometers",
    label: "Km desde",
    format: (v: string) => Number(v).toLocaleString(),
  },
  {
    key: "maxKilometers",
    label: "Km hasta",
    format: (v: string) => Number(v).toLocaleString(),
  },
  { key: "minYear", label: "Año desde" },
  { key: "maxYear", label: "Año hasta" },
  { key: "brandId", label: "Marca" },
  { key: "fuelType", label: "Combustible" },
];

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Leer filtros de la URL
  const filters = useMemo<VehicleFilters>(() => {
    const result: VehicleFilters = {};

    const minKilometers = searchParams.get("minKilometers");
    const maxKilometers = searchParams.get("maxKilometers");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const brandId = searchParams.get("brandId");
    const fuelType = searchParams.get("fuelType");

    if (minKilometers) result.minKilometers = minKilometers;
    if (maxKilometers) result.maxKilometers = maxKilometers;
    if (minYear) result.minYear = minYear;
    if (maxYear) result.maxYear = maxYear;
    if (brandId) result.brandId = brandId;
    if (fuelType) result.fuelType = fuelType;

    return result;
  }, [searchParams]);

  const handleClearFilters = () => navigate("/vehicles");

  return (
    <div className="container">
      <Table
        getRows={getVehicles}
        columns={columns}
        filters={filters}
        filterLabels={FILTER_LABELS}
        onClearFilters={handleClearFilters}
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
