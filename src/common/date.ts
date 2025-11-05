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

export function formatDate(
  dateString: string | null | undefined,
  fallback: string = "Fecha inválida",
): string {
  if (!dateString) return fallback;

  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
