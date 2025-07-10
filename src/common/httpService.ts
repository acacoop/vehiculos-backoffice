import type { RequestConfig, ApiResponse, ApiError, PaginationParams, BackendResponse } from '../types/common';
import { API_CONFIG, DEFAULT_HEADERS, HTTP_METHODS, METHODS_WITH_BODY } from './constants';

// Clase de error personalizada para errores de API
export class ApiException extends Error {
  public apiError: ApiError;

  constructor(apiError: ApiError, message?: string) {
    super(message || apiError.title);
    this.name = 'ApiException';
    this.apiError = apiError;
  }
}

// Construir query string desde parámetros
function buildQueryString(params: Record<string, any>): string {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return filteredParams ? `?${filteredParams}` : '';
}

// Combinar parámetros de query con paginación
function buildParams(queryParams?: Record<string, any>, pagination?: PaginationParams): Record<string, any> {
  const params: Record<string, any> = { ...queryParams };
  
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
): Promise<ApiResponse<T>> {
  try {
    const { uri, queryParams, pagination, body, headers } = config;
    
    // Construir URL completa
    const allParams = buildParams(queryParams, pagination);
    const queryString = buildQueryString(allParams);
    const url = `${API_CONFIG.BASE_URL}${uri}${queryString}`;
    
    // Configurar headers
    const requestHeaders = {
      ...DEFAULT_HEADERS,
      ...headers,
    };
    
    // Configurar request
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };
    
    // Agregar body si es necesario
    if (body && METHODS_WITH_BODY.includes(method as any)) {
      requestConfig.body = JSON.stringify(body);
    }
    
    // Hacer el request
    const response = await fetch(url, requestConfig);

    // Parsear respuesta
    const responseData: BackendResponse<T> = await response.json();

    console.log(`Response from ${method} ${url}:`, responseData);

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok || responseData.status === 'error') {
      const apiError: ApiError = {
        type: 'about:blank',
        title: responseData.message || 'Error en la API',
        status: response.status,
        detail: responseData.message || response.statusText,
        instance: response.url,
      };
      
      throw new ApiException(apiError);
    }
    
    const returnApiResponse: ApiResponse<T> = {
      data: responseData.data, // Retornamos solo los datos del backend
      success: true,
    };

    console.log(`Successful response from ${method} ${url}:`, returnApiResponse);

    // Retornar la respuesta formateada
    return returnApiResponse;
    
  } catch (error) {
    if (error instanceof ApiException) {
      return {
        data: {} as T,
        success: false,
        error: error.apiError,
      };
    }
    
    // Error de red u otro tipo
    const networkError: ApiError = {
      type: 'network-error',
      title: 'Error de conexión',
      status: 0,
      detail: error instanceof Error ? error.message : 'Error desconocido',
    };
    
    return {
      data: {} as T,
      success: false,
      error: networkError,
    };
  }
}

// Métodos HTTP específicos
export const httpService = {
  get: <T>(config: RequestConfig): Promise<ApiResponse<T>> => 
    makeRequest<T>(HTTP_METHODS.GET, config),
    
  post: <T>(config: RequestConfig): Promise<ApiResponse<T>> => 
    makeRequest<T>(HTTP_METHODS.POST, config),
    
  put: <T>(config: RequestConfig): Promise<ApiResponse<T>> => 
    makeRequest<T>(HTTP_METHODS.PUT, config),
    
  patch: <T>(config: RequestConfig): Promise<ApiResponse<T>> => 
    makeRequest<T>(HTTP_METHODS.PATCH, config),
    
  delete: <T>(config: RequestConfig): Promise<ApiResponse<T>> => 
    makeRequest<T>(HTTP_METHODS.DELETE, config),
};
