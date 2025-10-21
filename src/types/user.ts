export interface User {
  id: string; // UUID format
  firstName: string;
  lastName: string;
  email: string;
  cuit: number;
  active?: boolean; // Campo para indicar si el usuario está activo
}

// Parámetros para filtrar usuarios (coincide con OpenAPI)
export interface UserFilterParams {
  email?: string;
  cuit?: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
  search?: string;
}

// Respuesta del backend según OpenAPI
export interface ApiResponseData<T> {
  status: "success" | "error";
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number; // Cambiado de totalPages a pages
  };
}

// Respuesta específica para usuarios
export interface UsersApiResponse extends ApiResponseData<User[]> {
  data: User[];
}
