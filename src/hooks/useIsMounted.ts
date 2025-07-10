import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para verificar si el componente está montado
 * Previene actualizaciones de estado en componentes desmontados
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return () => isMountedRef.current;
}

/**
 * Hook personalizado para manejar estados de carga con cleanup automático
 */
export function useAsyncState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);
  const isMounted = useIsMounted();

  const setSafeState = (value: T | ((prev: T) => T)) => {
    if (isMounted()) {
      setState(value);
    }
  };

  return [state, setSafeState] as const;
}
