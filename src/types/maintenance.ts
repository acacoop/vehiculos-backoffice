export interface Maintenance {
  id: string; // UUID format
  name: string;
}

// Parámetros para filtrar mantenimientos (camelCase para uso interno)
export interface MaintenanceFilterParams {
  name?: string;
}

// Respuesta específica para mantenimientos
export interface MaintenancesApiResponse {
  status: "success" | "error";
  message: string;
  data: Maintenance[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
