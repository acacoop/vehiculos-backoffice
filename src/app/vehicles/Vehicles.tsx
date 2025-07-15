import "./Vehicles.css";
import Table from "../../components/Table/table";
import { getVehicles } from "../../services/vehicles";
import type { ServiceResponse, PaginationParams } from "../../common";
import AddVehicle from "../../components/AddCar/AddVehicle";

const columns = [
  { field: "licensePlate", headerName: "Patente", flex: 1 },
  { field: "brand", headerName: "Marca", flex: 1 },
  { field: "model", headerName: "Modelo", flex: 1 },
  { field: "year", headerName: "Año", flex: 1 },
];

export default function Vehicles() {
  // Función para obtener vehículos con paginación
  const getVehiclesData = async (
    pagination: PaginationParams
  ): Promise<ServiceResponse<any[]>> => {
    try {
      const response = await getVehicles(undefined, pagination);

      console.log("🚗 Vehicles - Respuesta de vehículos:", response);

      if (response.success) {
        const mappedData = response.data.map((vehicle: any, index: number) => {
          const mappedItem = {
            id: vehicle.id || `vehicle-${Date.now()}-${index}`,
            licensePlate: vehicle.licensePlate || "N/A",
            brand: vehicle.brand || "N/A",
            model: vehicle.model || "N/A",
            year: vehicle.year?.toString() || "N/A",
          };

          console.log("🔄 Vehicles - Item mapeado:", mappedItem);
          return mappedItem;
        });

        console.log("✅ Vehicles - Datos finales mapeados:", mappedData);

        return {
          success: true,
          data: mappedData,
          pagination: response.pagination,
        };
      } else {
        console.error("❌ Vehicles - Error en respuesta:", response.message);
        return {
          success: false,
          data: [],
          message: response.message,
        };
      }
    } catch (error) {
      console.error("❌ Vehicles - Error al cargar vehículos:", error);
      return {
        success: false,
        data: [],
        message: "Error al cargar vehículos",
      };
    }
  };

  return (
    <div className="vehicles-container">
      <h1 className="vehicles-title">Gestión de Vehículos</h1>
      <Table
        getRows={getVehiclesData}
        columns={columns}
        title=""
        showEditColumn={true}
        editRoute="/vehicleedit"
      />
      <AddVehicle />
    </div>
  );
}
