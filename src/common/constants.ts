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

// Etiquetas de trimestres
export const QUARTER_LABELS: Record<number, string> = {
  1: "Q1",
  2: "Q2",
  3: "Q3",
  4: "Q4",
} as const;

// Estados de checklist de mantenimiento
export const CHECKLIST_STATUS = {
  APPROVED: "Aprobado",
  WITH_FAILURES: "Con fallos",
  OVERDUE: "Vencido",
  PENDING: "Pendiente",
} as const;

export type ChecklistStatus =
  (typeof CHECKLIST_STATUS)[keyof typeof CHECKLIST_STATUS];
