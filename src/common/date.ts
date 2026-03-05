// ============================================================================
// DISPLAY FORMATTING - For showing dates to users
// ============================================================================

/**
 * Parses a date string handling timezone issues.
 * For date-only strings (YYYY-MM-DD), treats them as local dates to avoid UTC shift.
 * For full ISO strings with time, parses normally.
 */
export function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) return value;

  // Check if it's a date-only string (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // Parse as local date by adding time component without Z
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // For full datetime strings, parse normally
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date to DD/MM/YYYY
 * @example formatDate("2024-01-15") => "15/01/2024"
 */
export function formatDate(value: unknown, fallback = "Sin fecha"): string {
  if (!value) return fallback;

  try {
    const date = parseDate(value as string | Date);
    if (!date) return fallback;

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
    const date = parseDate(value as string | Date);
    if (!date) return fallback;

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
    const date = parseDate(value as string | Date);
    if (!date) return fallback;

    const now = new Date();
    // Compare dates at midnight to avoid time-of-day issues
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dateOnly.getTime() - nowOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

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
 * Safely converts a string or Date to "YYYY-MM-DD" format for <input type="date">
 * Handles timezone issues by treating date-only strings (YYYY-MM-DD) as-is,
 * and properly parsing ISO strings and Date objects.
 * @example toInputDateSafe("2024-01-15") => "2024-01-15"
 * @example toInputDateSafe(new Date()) => "2024-01-15"
 * @example toInputDateSafe("2024-01-15T00:00:00.000Z") => "2024-01-15" (local)
 */
export function toInputDateSafe(value: string | Date | null | undefined): string {
  // If null/undefined, return today's date
  if (!value) {
    return toInputDate(new Date());
  }

  // If already a Date object
  if (value instanceof Date) {
    return toInputDate(value);
  }

  // If it's already in YYYY-MM-DD format, return as-is (no conversion needed)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // For ISO strings or other formats, parse properly to avoid timezone issues
  const parsed = parseDate(value);
  if (parsed) {
    return toInputDate(parsed);
  }

  // Fallback to today
  return toInputDate(new Date());
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
 * Converts "YYYY-MM-DD" input to date string for API requests.
 * Returns the date as-is (YYYY-MM-DD format) to avoid timezone conversion issues.
 * @example inputDateToAPI("2024-01-15") => "2024-01-15"
 */
export function inputDateToAPI(dateStr: string): string {
  // Validate format and return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // If it's a full ISO string, extract just the date part
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  return dateStr;
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
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (startDate) {
    const start = parseDate(startDate);
    if (start && start > todayOnly) return false;
  }

  if (endDate) {
    const end = parseDate(endDate);
    if (end) {
      // End date is inclusive - add 1 day and compare
      const endPlusOne = new Date(end);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
      return todayOnly < endPlusOne;
    }
  }

  return true;
}
