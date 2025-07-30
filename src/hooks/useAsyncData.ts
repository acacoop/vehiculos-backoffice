import { useState, useEffect } from "react";
import { useIsMounted } from "./useIsMounted";

interface UseAsyncDataOptions {
  immediate?: boolean; // Si debe ejecutarse inmediatamente
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para manejar fetching de datos con cleanup automático
 */
export function useAsyncData<T>(
  fetchFunction: () => Promise<T>,
  options: UseAsyncDataOptions = { immediate: true }
): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useIsMounted();

  const fetchData = async () => {
    try {
      if (isMounted()) setLoading(true);
      if (isMounted()) setError(null);

      const result = await fetchFunction();

      if (isMounted()) {
        setData(result);
      }
    } catch (err) {
      if (isMounted()) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
