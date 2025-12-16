import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

/**
 * Hook para manejar parámetros de filtro provenientes de gráficos.
 * Facilita la navegación desde un gráfico a una página de detalle con filtros.
 *
 * @example
 * ```tsx
 * // En la página de métricas:
 * const handleChartClick = (event: ChartClickEvent) => {
 *   navigate(`/vehicles?brand=${event.data.brand}`);
 * };
 *
 * // En la página de vehículos:
 * const { filters, clearFilters, hasFilters } = useChartFilters();
 * // filters = { brand: "Toyota" }
 * ```
 */
export function useChartFilters<T extends Record<string, string>>() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result as T;
  }, [searchParams]);

  const hasFilters = useMemo(() => {
    return searchParams.toString().length > 0;
  }, [searchParams]);

  const clearFilters = () => {
    setSearchParams({});
  };

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const getFilter = (key: string): string | null => {
    return searchParams.get(key);
  };

  return {
    /** Objeto con todos los filtros actuales */
    filters,
    /** Indica si hay algún filtro activo */
    hasFilters,
    /** Limpia todos los filtros */
    clearFilters,
    /** Establece o elimina un filtro específico */
    setFilter,
    /** Obtiene el valor de un filtro específico */
    getFilter,
  };
}

export default useChartFilters;
