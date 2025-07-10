// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000",
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  TIMEOUT: 10000, // 10 segundos
} as const;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Métodos HTTP estándar
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// Métodos que pueden tener body
export const METHODS_WITH_BODY = [
  HTTP_METHODS.POST,
  HTTP_METHODS.PUT,
  HTTP_METHODS.PATCH,
] as const;
