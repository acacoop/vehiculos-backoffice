// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000",
  DEFAULT_OFFSET: 0,
  DEFAULT_LIMIT: 10,
  TIMEOUT: 10000, // 10 segundos
} as const;
