import {
  API_CONFIG,
  type PaginationData,
  type PaginationParams,
  type ServiceResponse,
} from "../common";
import { getAccessToken } from "../common/auth";

export interface TFilters {
  [key: string]: any;
}

export type ApiFindOptions<TFilters> = {
  pagination?: PaginationParams;
  search?: string;
  filters?: TFilters;
};

export type ParamConfig = {
  field: string;
  transform?: (value: any) => string;
};

export const addApiFindOptions = <TFilters>(
  usp: URLSearchParams,
  options: ApiFindOptions<TFilters>,
  paramsConfig: ParamConfig[] = []
) => {
  addPaginationParams(
    usp,
    options.pagination
      ? options.pagination
      : {
          page: API_CONFIG.DEFAULT_PAGE,
          limit: API_CONFIG.DEFAULT_LIMIT,
        }
  );

  addSearchParam(usp, options.search);

  if (options.filters) {
    addGeneralFilters(usp, options.filters, paramsConfig);
  }
};

export const addPaginationParams = (
  usp: URLSearchParams,
  params: PaginationParams
) => {
  const page = params.page;
  const limit = params.limit;
  const offset = (page - 1) * limit;

  usp.set("limit", limit.toString());
  usp.set("offset", offset.toString());
};

export const addGeneralFilters = (
  usp: URLSearchParams,
  filters: Record<string, any>,
  paramsConfig: ParamConfig[]
) => {
  for (const paramConfig of paramsConfig) {
    const value = filters[paramConfig.field];
    if (value === undefined || value === null) continue;

    const transformedValue = paramConfig.transform
      ? paramConfig.transform(value)
      : value;
    usp.set(paramConfig.field, String(transformedValue));
  }
};

export const addSearchParam = (usp: URLSearchParams, search?: string) => {
  if (search) {
    usp.set("search", search);
  }
};

export async function apiFindAllItems<T>(
  uri: string,
  usp?: URLSearchParams,
  mapFunction?: (item: any) => T,
  errorMessage = "Error al obtener los datos"
): Promise<ServiceResponse<T[] | null>> {
  const arrayMapFunction = (items: any): T[] => {
    return mapFunction ? items.map(mapFunction) : (items as T[]);
  };

  return generalApiCall<T[]>(uri, "GET", errorMessage, arrayMapFunction, usp);
}

export async function apiFindItemById<T>(
  uri: string,
  itemId: string,
  mapFunction?: (item: any) => T,
  errorMessage = "Error al obtener el dato"
): Promise<ServiceResponse<T | null>> {
  return generalApiCall<T>(
    `${uri}/${itemId}`,
    "GET",
    errorMessage,
    mapFunction
  );
}

export async function apiCreateItem<T>(
  uri: string,
  payload: any,
  mapFunction?: (item: any) => T,
  errorMessage = "Error al crear el dato"
): Promise<ServiceResponse<T | null>> {
  return generalApiCall<T>(
    uri,
    "POST",
    errorMessage,
    mapFunction,
    undefined,
    payload
  );
}

export async function apiUpdateItem<T>(
  uri: string,
  itemId: string,
  payload: any,
  mapFunction?: (item: any) => T,
  errorMessage = "Error al actualizar el dato"
): Promise<ServiceResponse<T | null>> {
  return generalApiCall<T>(
    `${uri}/${itemId}`,
    "PATCH",
    errorMessage,
    mapFunction,
    undefined,
    payload
  );
}

export async function apiDeleteItem<T>(
  uri: string,
  itemId: string,
  mapFunction?: (item: any) => T,
  errorMessage = "Error al eliminar el dato"
): Promise<ServiceResponse<T | null>> {
  return generalApiCall<T>(
    `${uri}/${itemId}`,
    "DELETE",
    errorMessage,
    mapFunction
  );
}

async function generalApiCall<T>(
  uri: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  errorMessage = "Error en la solicitud",
  mapFunction?: (item: any) => T,
  usp?: URLSearchParams,
  body?: any
): Promise<ServiceResponse<T | null>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        data: null,
        message: "No se pudo obtener el token de autenticación",
      };
    }

    const url = `${API_CONFIG.BASE_URL}/${uri}`;
    const urlWithParams = usp ? `${url}?${usp.toString()}` : url;

    const response = await fetch(urlWithParams, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: errorMessage,
      };
    }

    const parsedResponse = await response.json().catch(() => ({}));

    const data = parsedResponse.data || null;
    const transformedData: T = mapFunction && data ? mapFunction(data) : data;

    const pagination = mapPaginationResponse(parsedResponse.pagination);

    return { success: true, data: transformedData, pagination };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error as any,
    };
  }
}

const mapPaginationResponse = (raw: any): PaginationData | undefined => {
  if (!raw || typeof raw !== "object") return undefined;

  const page = Number(raw.page) || 1;
  const pageSize = Number(raw.pageSize) || 10;
  const total = Number(raw.total) || 0;
  const pages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    pages,
  };
};
