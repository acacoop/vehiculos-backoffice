import "./Vehicles.css";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/table";
import { getVehicles } from "../../services/vehicles";
import type { ServiceResponse, PaginationParams } from "../../common";
import type { VehicleFilterParams } from "../../types/vehicle";

const columns = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "brand", headerName: "Marca", flex: 1 },
  { field: "model", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

const getVehiclesData = async (
  pagination: PaginationParams,
  options?: { search?: string }
): Promise<ServiceResponse<any[]>> => {
  try {
    let filters: VehicleFilterParams | undefined;

    if (options?.search) {
      const trimmedSearch = options.search.trim();
      if (trimmedSearch.length > 0) {
        filters = { search: trimmedSearch };
      }
    }

    const response = await getVehicles({ filters, pagination });

    if (!response.success || !response.data) {
      return {
        success: false,
        data: [],
        message: response.message,
      };
    }

    const mappedData = response.data.map((vehicle: any, index: number) => {
      const brandName =
        vehicle.brandName || vehicle.brand || vehicle.modelObj?.brand?.name;
      const modelName =
        vehicle.modelName || vehicle.model || vehicle.modelObj?.name;
      return {
        id: vehicle.id || `vehicle-${Date.now()}-${index}`,
        licensePlate: vehicle.licensePlate || "N/A",
        brand: brandName || "N/A",
        model: modelName || "N/A",
        year: vehicle.year?.toString() || "N/A",
      };
    });

    return {
      success: true,
      data: mappedData,
      pagination: response.pagination,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al cargar vehículos",
    };
  }
};

export default function Vehicles() {
  const navigate = useNavigate();

  return (
    <div className="vehicles-container">
      <Table
        getRows={getVehiclesData}
        columns={columns}
        title=""
        showEditColumn={true}
        editRoute="/vehicle/edit"
        showTableHeader={true}
        headerTitle="Gestión de Vehículos"
        showAddButton={true}
        addButtonText="Comenzar Registro"
        searchPlaceholder="Patente, Marca, Modelo"
        enableSearch
        onAddButtonClick={() => navigate("/vehicle/create")}
      />
    </div>
  );
}
