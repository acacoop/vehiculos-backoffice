// ============================================================================
// DISPLAY FORMATTING - For showing dates to users
// ============================================================================

/**
 * Formats a date to DD/MM/YYYY
 * @example formatDate("2024-01-15") => "15/01/2024"
 */
export function formatDate(value: unknown, fallback = "Sin fecha"): string {
  if (!value) return fallback;

  try {
    const date = new Date(value as string | Date);
    if (isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats a datetime to DD/MM/YYYY HH:MM
 * @example formatDateTime("2024-01-15T14:30:00Z") => "15/01/2024 14:30"
 */
export function formatDateTime(value: unknown, fallback = "Sin fecha"): string {
  if (!value) return fallback;

  try {
    const date = new Date(value as string | Date);
    if (isNaN(date.getTime())) return fallback;

    const dateStr = date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} ${timeStr}`;
  } catch {
    return fallback;
  }
}

/**
 * Formats end dates, showing "Indefinida" for null/empty values
 * @example formatEndDate(null) => "Indefinida"
 */
export function formatEndDate(value: unknown): string {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return "Indefinida";
  }
  return formatDate(value, "Indefinida");
}

/**
 * Formats a date as relative time: "Hoy", "Ayer", "Hace 3 días", etc.
 * @example formatRelativeDate(new Date()) => "Hoy"
 */
export function formatRelativeDate(
  value: unknown,
  fallback = "Sin fecha",
): string {
  if (!value) return fallback;

  try {
    const date = new Date(value as string | Date);
    if (isNaN(date.getTime())) return fallback;

    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    if (diffDays === -1) return "Ayer";
    if (diffDays > 1) return `En ${diffDays} días`;
    if (diffDays < -1) return `Hace ${Math.abs(diffDays)} días`;

    return formatDate(value, fallback);
  } catch {
    return fallback;
  }
}

// ============================================================================
// FORM INPUTS - For working with <input type="date"> and <input type="time">
// ============================================================================

/**
 * Converts a Date to "YYYY-MM-DD" format for <input type="date">
 * @example toInputDate(new Date("2024-01-15")) => "2024-01-15"
 */
export function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date to "HH:MM" format for <input type="time">
 * @example toInputTime(new Date("2024-01-15T14:30")) => "14:30"
 */
export function toInputTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Creates a Date from "YYYY-MM-DD" and "HH:MM" input values
 * @example inputsToDate("2024-01-15", "14:30") => Date object
 */
export function inputsToDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`);
}

// ============================================================================
// API COMMUNICATION - For sending/receiving dates to/from backend
// ============================================================================

/**
 * Converts a Date to ISO string for API requests
 * @example dateToISO(new Date("2024-01-15T14:30")) => "2024-01-15T14:30:00.000Z"
 */
export function dateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Converts "YYYY-MM-DD" input to ISO string for API requests (date only, time at midnight)
 * @example inputDateToISO("2024-01-15") => "2024-01-15T00:00:00.000Z"
 */
export function inputDateToISO(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

// ============================================================================
// UTILITIES - Helper functions
// ============================================================================

/**
 * Checks if a period is currently active
 * @example isActive("2024-01-01", "2024-12-31") => true if today is within range
 */
export function isActive(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): boolean {
  const now = new Date();

  if (startDate) {
    const startDateTime = new Date(startDate);
    if (startDateTime > now) return false;
  }

  if (endDate) {
    const endDateTime = new Date(endDate);
    return endDateTime > now;
  }

  return true;
}
