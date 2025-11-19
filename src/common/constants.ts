// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000",
  DEFAULT_OFFSET: 0,
  DEFAULT_LIMIT: 10,
  TIMEOUT: 10000, // 10 segundos
} as const;

// Tipos de vehículos
export const VEHICLE_TYPES = [
  "Camión",
  "Convertible",
  "Coupé",
  "Furgón",
  "Hatchback",
  "Pickup",
  "Sedan",
  "SUV",
  "Van",
  "Wagon",
] as const;

// Tipos de transmisión
export const TRANSMISSION_TYPES = ["Manual", "Automática", "CVT"] as const;

// Tipos de combustible
export const FUEL_TYPES = [
  "Nafta",
  "Diésel",
  "GNC",
  "Híbrido",
  "Eléctrico",
  "Flex",
] as const;
