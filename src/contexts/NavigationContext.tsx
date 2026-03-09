import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationContextType {
  /** Navega a la página anterior en el historial */
  goBack: (fallbackPath?: string) => void;
  /** Ruta de la página anterior (null si no hay) */
  previousPath: string | null;
  /** Historial completo de rutas */
  history: string[];
}

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const historyStack = useRef<string[]>([]);
  const isNavigatingBack = useRef(false);

  useEffect(() => {
    // Si estamos navegando hacia atrás, no agregar al historial
    if (isNavigatingBack.current) {
      isNavigatingBack.current = false;
      return;
    }

    const currentPath = location.pathname;
    const lastPath = historyStack.current[historyStack.current.length - 1];

    // Evitar duplicados consecutivos
    if (lastPath !== currentPath) {
      historyStack.current.push(currentPath);

      // Limitar el tamaño del historial para evitar memory leaks
      if (historyStack.current.length > 50) {
        historyStack.current = historyStack.current.slice(-30);
      }
    }
  }, [location.pathname]);

  const goBack = useCallback(
    (fallbackPath?: string) => {
      if (historyStack.current.length > 1) {
        isNavigatingBack.current = true;
        historyStack.current.pop(); // Quitar página actual
        const previousPath =
          historyStack.current[historyStack.current.length - 1];
        navigate(previousPath);
      } else if (fallbackPath) {
        // Si no hay historial, usar la ruta de fallback
        navigate(fallbackPath);
      } else {
        // Por defecto, ir al inicio
        navigate("/");
      }
    },
    [navigate],
  );

  const previousPath =
    historyStack.current.length > 1
      ? historyStack.current[historyStack.current.length - 2]
      : null;

  return (
    <NavigationContext.Provider
      value={{
        goBack,
        previousPath,
        history: historyStack.current,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigation debe usarse dentro de un NavigationProvider",
    );
  }
  return context;
}
