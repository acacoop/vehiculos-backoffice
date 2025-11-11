export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

// Configuración de paginación
export interface PaginationParams {
  limit: number;
  offset: number;
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
  queryParams?: Record<string, string | number | boolean>;
  pagination?: PaginationParams;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Datos de paginación para el frontend
export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// Tipo base para filtros de cualquier entidad
export interface FilterParams {
  [key: string]: string | number | boolean | undefined | null;
}

export type OkServiceResponse<T> = {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
  readonly pagination?: PaginationData;
};

export type ErrorServiceResponse = {
  readonly success: false;
  readonly message: string;
  readonly error?: ApiError;
};

export type ServiceResponse<T> = OkServiceResponse<T> | ErrorServiceResponse;
