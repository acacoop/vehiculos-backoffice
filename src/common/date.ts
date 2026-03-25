export function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) return value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

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

export function formatEndDate(value: unknown): string {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return "Indefinida";
  }
  return formatDate(value, "Indefinida");
}

export function formatRelativeDate(
  value: unknown,
  fallback = "Sin fecha",
): string {
  if (!value) return fallback;

  try {
    const date = parseDate(value as string | Date);
    if (!date) return fallback;

    const now = new Date();
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

export function toInputDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toInputDateTimeSafe(
  value: string | Date | null | undefined,
): string {
  if (!value) return toInputDateTime(new Date());
  if (value instanceof Date) return toInputDateTime(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;

  const parsed = parseDate(value);
  return parsed ? toInputDateTime(parsed) : toInputDateTime(new Date());
}

export function dateToISO(date: Date): string {
  return date.toISOString();
}

export function inputDateTimeToAPI(
  datetimeStr: string | null | undefined,
): string {
  if (!datetimeStr) {
    return new Date().toISOString();
  }

  if (datetimeStr.includes("Z") || /\+\d{2}:\d{2}$/.test(datetimeStr)) {
    return datetimeStr;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetimeStr)) {
    return new Date(datetimeStr).toISOString();
  }

  return new Date(datetimeStr).toISOString();
}

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
      const endPlusOne = new Date(end);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
      return todayOnly < endPlusOne;
    }
  }

  return true;
}
