// Configuración de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Respuesta paginada del backend (según OpenAPI)
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number; // Cambiado de totalPages a pages
}

// Error según RFC 7807 (coincide con OpenAPI)
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

// Configuración para requests
export interface RequestConfig {
  uri: string;
  queryParams?: Record<string, any>;
  pagination?: PaginationParams;
  body?: any;
  headers?: Record<string, string>;
}

// Respuesta unificada del backend (según OpenAPI)
export interface BackendResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
}

// Respuesta interna de nuestro httpService
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}
