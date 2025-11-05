import { getAccessToken } from "../common/auth";
import { API_CONFIG } from "../common/constants";
import type {
  FilterParams,
  PaginationParams,
  OkServiceResponse,
  ErrorServiceResponse,
  ApiError,
  PaginationData,
} from "../types/common";

export type ApiFindOptions<TFilters extends FilterParams> = {
  pagination?: PaginationParams;
  search?: string;
  filters?: TFilters;
};

export type ParamConfig = {
  field: string;
  transform?: (value: string | number | boolean) => string;
};

const addApiFindOptions = <TFilters extends FilterParams>(
  usp: URLSearchParams,
  options: ApiFindOptions<TFilters>,
  paramsConfig: ParamConfig[] = [],
) => {
  addPaginationParams(
    usp,
    options.pagination
      ? options.pagination
      : {
          page: API_CONFIG.DEFAULT_PAGE,
          limit: API_CONFIG.DEFAULT_LIMIT,
        },
  );

  addSearchParam(usp, options.search);

  if (options.filters) {
    addGeneralFilters(usp, options.filters, paramsConfig);
  }
};

const addPaginationParams = (
  usp: URLSearchParams,
  params: PaginationParams,
) => {
  const page = params.page;
  const limit = params.limit;
  const offset = (page - 1) * limit;

  usp.set("limit", limit.toString());
  usp.set("offset", offset.toString());
};

const addGeneralFilters = (
  usp: URLSearchParams,
  filters: Record<string, string | number | boolean | undefined | null>,
  paramsConfig: ParamConfig[],
) => {
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    const paramConfig = paramsConfig.find((p) => p.field === key);

    const transformedValue = paramConfig?.transform
      ? paramConfig.transform(value as string | number | boolean)
      : value;

    usp.set(paramConfig?.field ?? key, String(transformedValue));
  }
};

const addSearchParam = (usp: URLSearchParams, search?: string) => {
  if (search) {
    usp.set("search", search);
  }
};

export async function apiFindItems<T, TFilters extends FilterParams>({
  uri,
  findOptions,
  paramsConfig = [],
  mapFunction,
  errorMessage = "Error al obtener los datos",
}: {
  uri: string;
  findOptions?: ApiFindOptions<TFilters>;
  paramsConfig?: ParamConfig[];
  mapFunction?: (item: unknown) => T;
  errorMessage?: string;
}): Promise<OkServiceResponse<T[]> | ErrorServiceResponse> {
  const usp = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(usp, findOptions, paramsConfig);
  }

  const arrayMapFunction = (items: unknown): T[] => {
    if (!Array.isArray(items)) {
      return [];
    }
    return mapFunction ? items.map(mapFunction) : (items as T[]);
  };

  return generalApiCall({
    uri,
    method: "GET",
    errorMessage,
    mapFunction: arrayMapFunction,
    usp,
  });
}

export async function apiFindItemById<T>({
  uri,
  itemId,
  mapFunction,
  errorMessage = "Error al obtener el dato",
}: {
  uri: string;
  itemId: string;
  mapFunction?: (item: unknown) => T;
  errorMessage?: string;
}): Promise<OkServiceResponse<T> | ErrorServiceResponse> {
  return generalApiCall<T>({
    uri: `${uri}/${itemId}`,
    method: "GET",
    errorMessage,
    mapFunction,
  });
}

export async function apiCreateItem<T>({
  uri,
  payload,
  mapFunction,
  errorMessage = "Error al crear el dato",
}: {
  uri: string;
  payload: unknown;
  mapFunction?: (item: unknown) => T;
  errorMessage?: string;
}): Promise<OkServiceResponse<T> | ErrorServiceResponse> {
  return generalApiCall<T>({
    uri,
    method: "POST",
    errorMessage,
    mapFunction,
    body: payload as Record<string, unknown>,
  });
}

export async function apiUpdateItem<T>({
  uri,
  itemId,
  payload,
  mapFunction,
  errorMessage = "Error al actualizar el dato",
}: {
  uri: string;
  itemId: string;
  payload: unknown;
  mapFunction?: (item: unknown) => T;
  errorMessage?: string;
}): Promise<OkServiceResponse<T> | ErrorServiceResponse> {
  return generalApiCall<T>({
    uri: `${uri}/${itemId}`,
    method: "PATCH",
    errorMessage,
    mapFunction,
    body: payload as Record<string, unknown>,
  });
}

export async function apiDeleteItem<T>({
  uri,
  itemId,
  mapFunction,
  errorMessage = "Error al eliminar el dato",
}: {
  uri: string;
  itemId: string;
  mapFunction?: (item: unknown) => T;
  errorMessage?: string;
}): Promise<OkServiceResponse<T> | ErrorServiceResponse> {
  return generalApiCall<T>({
    uri: `${uri}/${itemId}`,
    method: "DELETE",
    errorMessage,
    mapFunction,
  });
}

export async function generalApiCall<T>({
  uri,
  method,
  errorMessage = "Error en la solicitud",
  mapFunction,
  usp,
  body,
}: {
  uri: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  errorMessage?: string;
  mapFunction?: (item: unknown) => T;
  usp?: URLSearchParams;
  body?: Record<string, unknown>;
}): Promise<OkServiceResponse<T> | ErrorServiceResponse> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
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
      let parsedErrorMessage = errorMessage;
      let apiError: ApiError | undefined;

      try {
        const errorResponse = await response.json();
        if (errorResponse.type && errorResponse.title) {
          // Es un error RFC7807
          apiError = errorResponse as ApiError;
          parsedErrorMessage = apiError.detail || apiError.title;
        } else if (errorResponse.message) {
          parsedErrorMessage = errorResponse.message;
        }
      } catch {
        // Si no se puede parsear, usar mensaje genérico
      }

      return {
        success: false,
        message: parsedErrorMessage,
        error: apiError,
      };
    }

    const parsedResponse = await response.json().catch(() => ({}));

    const data = parsedResponse.data || null;
    const transformedData: T = mapFunction && data ? mapFunction(data) : data;

    const pagination = mapPaginationResponse(parsedResponse.pagination);

    return { success: true, data: transformedData, pagination };
  } catch {
    return {
      success: false,
      message: errorMessage,
    };
  }
}

const mapPaginationResponse = (raw: unknown): PaginationData | undefined => {
  if (!raw || typeof raw !== "object") return undefined;

  const paginationData = raw as Record<string, unknown>;
  const page = Number(paginationData.page) || 1;
  const pageSize = Number(paginationData.pageSize) || 10;
  const total = Number(paginationData.total) || 0;
  const pages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    pages,
  };
};
