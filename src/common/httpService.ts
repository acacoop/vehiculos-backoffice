import type {
  RequestConfig,
  ApiError,
  PaginationParams,
  BackendResponse,
} from "../types/common";
import { ResponseStatus } from "../types/common";
import {
  API_CONFIG,
  DEFAULT_HEADERS,
  HTTP_METHODS,
  METHODS_WITH_BODY,
} from "./constants";
import { getAccessToken } from "./auth";

// Clase de error personalizada para errores de API
export class ApiException extends Error {
  public apiError: ApiError;

  constructor(apiError: ApiError, message?: string) {
    super(message || apiError.title);
    this.name = "ApiException";
    this.apiError = apiError;
  }
}

// Construir query string desde parámetros
function buildQueryString(params: Record<string, unknown>): string {
  const filteredParams = Object.entries(params)
    .filter((entry) => {
      const value = entry[1];
      return value !== undefined && value !== null && value !== "";
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  return filteredParams ? `?${filteredParams}` : "";
}

// Combinar parámetros de query con paginación
function buildParams(
  queryParams?: Record<string, unknown>,
  pagination?: PaginationParams
): Record<string, unknown> {
  const params: Record<string, unknown> = { ...(queryParams || {}) };

  if (pagination) {
    params.page = pagination.page ?? API_CONFIG.DEFAULT_PAGE;
    params.limit = pagination.limit ?? API_CONFIG.DEFAULT_LIMIT;
  }

  return params;
}

// Función base para hacer requests HTTP
async function makeRequest<T>(
  method: string,
  config: RequestConfig
): Promise<BackendResponse<T>> {
  try {
    const { uri, queryParams, pagination, body, headers } = config;

    // Construir URL completa
    const allParams = buildParams(queryParams, pagination);
    const queryString = buildQueryString(allParams);
    const url = `${API_CONFIG.BASE_URL}${uri}${queryString}`;

    // Configurar headers
  const requestHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    // Add Authorization header if token available
    const token = await getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
      if (import.meta.env.DEV) console.log(token);
    }

    // Configurar request
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Agregar body si es necesario
  const METHODS_WITH_BODY_SET = new Set<string>(METHODS_WITH_BODY as readonly string[]);
  if (body && METHODS_WITH_BODY_SET.has(method)) {
      requestConfig.body = JSON.stringify(body);
    }

    // Hacer el request
    const response = await fetch(url, requestConfig);

    // Parsear respuesta
    const responseData: BackendResponse<T> = await response.json();

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok || responseData.status === "error") {
      const apiError: ApiError = {
        type: "about:blank",
        title: responseData.message || "Error en la API",
        status: response.status,
        detail: responseData.message || response.statusText,
        instance: response.url,
      };

      throw new ApiException(apiError);
    }

    const returnApiResponse: BackendResponse<T> = {
      status: responseData.status,
      message: responseData.message || "",
      data: responseData.data,
      pagination: responseData.pagination,
    };

    // Retornar la respuesta formateada
    return returnApiResponse;
  } catch (error) {
    if (error instanceof ApiException) {
      return {
        status: ResponseStatus.ERROR,
        message: error.apiError.detail || error.apiError.title,
        data: {} as T,
      };
    }

    // Error de red u otro tipo
    return {
      status: ResponseStatus.ERROR,
      message: error instanceof Error ? error.message : "Error desconocido",
      data: {} as T,
    };
  }
}

// Métodos HTTP específicos
export const httpService = {
  get: <T>(config: RequestConfig): Promise<BackendResponse<T>> =>
    makeRequest<T>(HTTP_METHODS.GET, config),

  post: <T>(config: RequestConfig): Promise<BackendResponse<T>> =>
    makeRequest<T>(HTTP_METHODS.POST, config),

  put: <T>(config: RequestConfig): Promise<BackendResponse<T>> =>
    makeRequest<T>(HTTP_METHODS.PUT, config),

  patch: <T>(config: RequestConfig): Promise<BackendResponse<T>> =>
    makeRequest<T>(HTTP_METHODS.PATCH, config),

  delete: <T>(config: RequestConfig): Promise<BackendResponse<T>> =>
    makeRequest<T>(HTTP_METHODS.DELETE, config),
};
