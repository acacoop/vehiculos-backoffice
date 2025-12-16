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

// Opciones de filtro para tipos de combustible
export const FUEL_TYPE_OPTIONS = FUEL_TYPES.map((fuel) => ({
  label: fuel,
  value: fuel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""),
}));

// Etiquetas de trimestres
export const QUARTER_LABELS: Record<number, string> = {
  1: "Q1",
  2: "Q2",
  3: "Q3",
  4: "Q4",
} as const;

// Opciones de filtro para trimestres
export const QUARTER_OPTIONS = [
  { label: "1er Trimestre", value: "1" },
  { label: "2do Trimestre", value: "2" },
  { label: "3er Trimestre", value: "3" },
  { label: "4to Trimestre", value: "4" },
];

// Generar opciones de año (desde 2020 hasta el año actual + 1)
const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
  { length: currentYear - 2020 + 2 },
  (_, i) => ({
    label: String(2020 + i),
    value: String(2020 + i),
  })
);

// Estados de control trimestral
export const QUARTERLY_CONTROL_STATUS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  WITH_FAILURES: "Con fallos",
  OVERDUE: "Vencido",
} as const;

// Estados de item de control trimestral
export const QUARTERLY_CONTROL_ITEM_STATUS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
} as const;

// Backend enum values (to avoid magic strings)
export const BACKEND_QUARTERLY_CONTROL_ITEM_STATUS = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type BackendQuarterlyControlItemStatus =
  (typeof BACKEND_QUARTERLY_CONTROL_ITEM_STATUS)[keyof typeof BACKEND_QUARTERLY_CONTROL_ITEM_STATUS];

// Mapping: backend key -> UI label
export const BACKEND_TO_UI_QUARTERLY_CONTROL_STATUS: Record<
  BackendQuarterlyControlItemStatus,
  string
> = {
  [BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.PENDIENTE]:
    QUARTERLY_CONTROL_ITEM_STATUS.PENDING,
  [BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.APROBADO]:
    QUARTERLY_CONTROL_ITEM_STATUS.APPROVED,
  [BACKEND_QUARTERLY_CONTROL_ITEM_STATUS.RECHAZADO]:
    QUARTERLY_CONTROL_ITEM_STATUS.REJECTED,
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
