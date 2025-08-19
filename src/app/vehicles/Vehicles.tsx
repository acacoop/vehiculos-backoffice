import "./Vehicles.css";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/table";
import { getVehicles } from "../../services/vehicles";
import type { ServiceResponse, PaginationParams } from "../../common";

const columns = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "brand", headerName: "Marca", flex: 1 },
  { field: "model", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

const getVehiclesData = async (
  pagination: PaginationParams
): Promise<ServiceResponse<any[]>> => {
  try {
    const response = await getVehicles(undefined, pagination);

    if (!response.success) {
      return {
        success: false,
        data: [],
        message: response.message,
      };
    }

    const mappedData = response.data.map((vehicle: any, index: number) => ({
      id: vehicle.id || `vehicle-${Date.now()}-${index}`,
      licensePlate: vehicle.licensePlate || "N/A",
      brand: vehicle.brand || "N/A",
      model: vehicle.model || "N/A",
      year: vehicle.year?.toString() || "N/A",
    }));

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
        onAddButtonClick={() => navigate("/vehicle/create")}
      />
    </div>
  );
}
