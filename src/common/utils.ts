import type { PaginationParams } from "../types/common";
import type { Vehicle } from "../types/vehicle";

// Utilidades para transformar parámetros
export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformObjectKeys(
  obj: Record<string, any>,
  transformer: (key: string) => string
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[transformer(key)] = value;
    }
  });

  return result;
}

// Transformar parámetros de camelCase a kebab-case (para enviar al backend)
export function transformParamsToKebabCase(
  params: Record<string, any>
): Record<string, any> {
  return transformObjectKeys(params, camelToKebabCase);
}

// Transformar parámetros de kebab-case a camelCase (para recibir del backend)
export function transformParamsToCamelCase(
  params: Record<string, any>
): Record<string, any> {
  return transformObjectKeys(params, kebabToCamelCase);
}

/**
 * Construye query params incluyendo filtros y paginación
 */
export function buildQueryParams(
  filters?: Record<string, any>,
  pagination?: PaginationParams
): URLSearchParams {
  const queryParams = new URLSearchParams();

  // Agregar filtros si existen
  if (filters) {
    const camelParams = transformParamsToCamelCase(filters);
    Object.entries(camelParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  // Parámetros de paginación
  if (pagination?.page !== undefined) {
    queryParams.append("page", pagination.page.toString());
  }

  if (pagination?.limit !== undefined) {
    queryParams.append("limit", pagination.limit.toString());
  }

  return queryParams;
}

// ================= Vehículos (helpers de formato) =================
/** Obtiene la marca usando múltiples posibles campos (migración incremental). */
export function getVehicleBrand(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";
  const brandCandidate =
    (vehicle as any).brandName ||
    vehicle.modelObj?.brand?.name ||
    vehicle.brand;
  return typeof brandCandidate === "string" ? brandCandidate : "";
}

/** Obtiene el modelo usando múltiples posibles campos (migración incremental). */
export function getVehicleModel(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";
  const modelCandidate =
    (vehicle as any).modelName || vehicle.modelObj?.name || vehicle.model;
  return typeof modelCandidate === "string" ? modelCandidate : "";
}

/** Devuelve "Marca Modelo" (sin espacios extra) */
export function formatVehicleBrandModel(vehicle?: Vehicle | null): string {
  const brand = getVehicleBrand(vehicle);
  const model = getVehicleModel(vehicle);
  return [brand, model].filter(Boolean).join(" ");
}

/** Devuelve "Marca Modelo (Año)" si hay año. */
export function formatFullVehicle(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";
  const base = formatVehicleBrandModel(vehicle);
  if (!base) {
    // fallback a patente si no hay marca/modelo
    return vehicle.year
      ? `${vehicle.licensePlate || ""} (${vehicle.year})`
      : vehicle.licensePlate || "";
  }
  return vehicle.year ? `${base} (${vehicle.year})` : base;
}
