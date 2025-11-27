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
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  WITH_FAILURES: "Con fallos",
  OVERDUE: "Vencido",
} as const;

// Estados de item de checklist de mantenimiento
export const CHECKLIST_ITEM_STATUS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
} as const;

// Backend enum values (to avoid magic strings)
export const BACKEND_CHECKLIST_ITEM_STATUS = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type BackendChecklistItemStatus =
  (typeof BACKEND_CHECKLIST_ITEM_STATUS)[keyof typeof BACKEND_CHECKLIST_ITEM_STATUS];

// Mapping: backend key -> UI label
export const BACKEND_TO_UI_STATUS: Record<BackendChecklistItemStatus, string> =
  {
    [BACKEND_CHECKLIST_ITEM_STATUS.PENDIENTE]: CHECKLIST_ITEM_STATUS.PENDING,
    [BACKEND_CHECKLIST_ITEM_STATUS.APROBADO]: CHECKLIST_ITEM_STATUS.APPROVED,
    [BACKEND_CHECKLIST_ITEM_STATUS.RECHAZADO]: CHECKLIST_ITEM_STATUS.REJECTED,
  } as const;

// User roles
export const USER_ROLE_LABELS = {
  USER: "Usuario",
  ADMIN: "Administrador",
} as const;

// Backend enum values for user roles
export const BACKEND_USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type BackendUserRole =
  (typeof BACKEND_USER_ROLES)[keyof typeof BACKEND_USER_ROLES];

// Mapping: backend role -> UI label
export const BACKEND_TO_UI_ROLE: Record<BackendUserRole, string> = {
  [BACKEND_USER_ROLES.USER]: USER_ROLE_LABELS.USER,
  [BACKEND_USER_ROLES.ADMIN]: USER_ROLE_LABELS.ADMIN,
} as const;
