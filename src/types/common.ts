export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

// Configuración de paginación
export interface PaginationParams {
  page: number;
  limit: number;
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

// Datos de paginación para el frontend
export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// Respuesta unificada del backend (según OpenAPI)
export interface BackendResponse<T> {
  status: ResponseStatus;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export type OkServiceResponse<T> = {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationData;
};

export type ErrorServiceResponse = {
  success: false;
  message: string;
  error?: ApiError;
};

// Respuesta de servicios con paginación para el frontend
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationData;
  error?: ApiError;
}
