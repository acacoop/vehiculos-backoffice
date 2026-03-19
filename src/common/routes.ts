/**
 * Constantes de rutas de la aplicación
 * Centraliza todas las rutas para evitar strings duplicados
 */

export const ROUTES = {
  LOGIN: "/login",
  HOME: "/home",
  METRICS: "/metrics",
  RISKS: "/risks",

  // Usuarios
  USERS: "/users",
  USER: (id: string | number) => `/users/${id}`,
  USER_NEW: "/users/new",

  // Vehículos
  VEHICLES: "/vehicles",
  VEHICLE: (id: string | number) => `/vehicles/${id}`,
  VEHICLE_NEW: "/vehicles/new",

  // Asignaciones
  ASSIGNMENTS: "/vehicles/assignments",
  ASSIGNMENT: (id: string | number) => `/vehicles/assignments/${id}`,
  ASSIGNMENT_NEW: "/vehicles/assignments/new",

  // Marcas
  BRANDS: "/vehicles/brands",
  BRAND: (id: string | number) => `/vehicles/brands/${id}`,
  BRAND_NEW: "/vehicles/brands/new",

  // Modelos
  MODELS: "/vehicles/models",
  MODEL: (id: string | number) => `/vehicles/models/${id}`,
  MODEL_NEW: "/vehicles/models/new",

  // Responsables
  RESPONSIBLES: "/vehicles/responsibles",
  RESPONSIBLE: (id: string | number) => `/vehicles/responsibles/${id}`,
  RESPONSIBLE_NEW: "/vehicles/responsibles/new",

  // Kilometrajes
  KILOMETERS_LOGS: "/vehicles/kilometersLogs",
  KILOMETERS_LOG: (id: string | number) => `/vehicles/kilometersLogs/${id}`,
  KILOMETERS_LOG_NEW: "/vehicles/kilometersLogs/new",

  // Reservas
  RESERVATIONS: "/reservations",
  RESERVATION: (id: string | number) => `/reservations/${id}`,
  RESERVATION_NEW: "/reservations/new",

  // Mantenimiento - Categorías
  MAINTENANCE_CATEGORIES: "/maintenance/categories",
  MAINTENANCE_CATEGORY: (id: string | number) =>
    `/maintenance/categories/${id}`,
  MAINTENANCE_CATEGORY_NEW: "/maintenance/categories/new",

  // Mantenimiento - Items
  MAINTENANCE_ITEMS: "/maintenance/items",
  MAINTENANCE_ITEM: (id: string | number) => `/maintenance/items/${id}`,
  MAINTENANCE_ITEM_NEW: "/maintenance/items/new",

  // Mantenimiento - Requerimientos
  MAINTENANCE_REQUIREMENTS: "/maintenance/requirements",
  MAINTENANCE_REQUIREMENT: (id: string | number) =>
    `/maintenance/requirements/${id}`,
  MAINTENANCE_REQUIREMENT_NEW: "/maintenance/requirements/new",

  // Mantenimiento - Registros
  MAINTENANCE_RECORDS: "/maintenance/records",
  MAINTENANCE_RECORD: (id: string | number) => `/maintenance/records/${id}`,
  MAINTENANCE_RECORD_NEW: "/maintenance/records/new",

  // Controles Trimestrales
  QUARTERLY_CONTROLS: "/quarterly-controls",
  QUARTERLY_CONTROL: (id: string | number) => `/quarterly-controls/${id}`,
  QUARTERLY_CONTROL_NEW: "/quarterly-controls/new",
  QUARTERLY_CONTROL_ITEM: (id: string | number) =>
    `/quarterly-controls/items/${id}`,

  // Legal
  PRIVACY_POLICY: "/privacy-policy",
} as const;

/**
 * Labels para breadcrumbs (mapeo de rutas a nombres legibles)
 */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.HOME]: "Inicio",
  [ROUTES.METRICS]: "Métricas",
  [ROUTES.RISKS]: "Riesgos",
  [ROUTES.USERS]: "Usuarios",
  [ROUTES.VEHICLES]: "Vehículos",
  [ROUTES.ASSIGNMENTS]: "Asignaciones",
  [ROUTES.BRANDS]: "Marcas",
  [ROUTES.MODELS]: "Modelos",
  [ROUTES.RESPONSIBLES]: "Responsables",
  [ROUTES.KILOMETERS_LOGS]: "Kilometrajes",
  [ROUTES.RESERVATIONS]: "Reservas",
  [ROUTES.MAINTENANCE_CATEGORIES]: "Categorías",
  [ROUTES.MAINTENANCE_ITEMS]: "Mantenimientos",
  [ROUTES.MAINTENANCE_REQUIREMENTS]: "Requerimientos",
  [ROUTES.MAINTENANCE_RECORDS]: "Registros",
  [ROUTES.QUARTERLY_CONTROLS]: "Controles Trimestrales",
};
