export interface Vehicle {
  id: string; // UUID format
  assignmentId?: string; // For maintenance assignment contexts
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  imgUrl?: string;
}

// Parámetros para filtrar vehículos (camelCase para uso interno)
export interface VehicleFilterParams {
  licensePlate?: string; // Se convertirá a license-plate
  brand?: string;
  model?: string;
  year?: number;
}

// Respuesta específica para vehículos
export interface VehiclesApiResponse {
  status: "success" | "error";
  message: string;
  data: Vehicle[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
