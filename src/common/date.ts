/**
 * Checks if a period is currently active based on start and end dates
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns True if the current period is active
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

/**
 * Formats a date value to locale string (DD/MM/YYYY)
 * @param value - Date string, Date object, or null/undefined
 * @param fallback - Fallback string if value is invalid
 * @returns Formatted date string or fallback
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
 * Formats a date-time value to locale string (DD/MM/YYYY HH:MM)
 * @param value - Date string, Date object, or null/undefined
 * @param fallback - Fallback string if value is invalid
 * @returns Formatted date-time string or fallback
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
 * Formats a date value for end dates, handling empty strings as "Indefinida"
 * @param value - Date string, Date object, or null/undefined/empty
 * @returns Formatted date string or "Indefinida"
 */
export function formatEndDate(value: unknown): string {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return "Indefinida";
  }
  return formatDate(value, "Indefinida");
}

/**
 * Formats a date as relative time (hace X días, en X días, hoy, ayer, mañana)
 * @param value - Date string, Date object, or null/undefined
 * @param fallback - Fallback string if value is invalid
 * @returns Relative time string
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
