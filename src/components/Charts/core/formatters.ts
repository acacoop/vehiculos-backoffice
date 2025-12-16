import type { XAxisFormat } from "./types";

// ============================================
// Date Formatters
// ============================================

export const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const formatters: Record<
  Exclude<XAxisFormat, "auto" | "none">,
  (value: string) => string
> = {
  // "2024" -> "2024"
  year: (value) => value,

  // "2024-01" -> "Ene 24"
  month: (value) => {
    const match = value.match(/^(\d{4})-(\d{2})$/);
    if (!match) return value;
    const year = match[1].slice(2);
    const monthNum = parseInt(match[2], 10);
    return `${MONTHS_SHORT[monthNum - 1]} ${year}`;
  },

  // "2024-Q1" or "2024-1" -> "Q1 24"
  quarter: (value) => {
    const match = value.match(/^(\d{4})-Q?(\d)$/);
    if (!match) return value;
    const year = match[1].slice(2);
    return `Q${match[2]} ${year}`;
  },

  // "2024-W01" or "2024-01-01" (week start) -> "S01 24"
  week: (value) => {
    // Format: "2024-W01"
    const weekMatch = value.match(/^(\d{4})-W(\d{2})$/);
    if (weekMatch) {
      const year = weekMatch[1].slice(2);
      return `S${weekMatch[2]} ${year}`;
    }
    // Format: "2024-01-01" (date) -> show as "01 Ene"
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const monthNum = parseInt(dateMatch[2], 10);
      return `${dateMatch[3]} ${MONTHS_SHORT[monthNum - 1]}`;
    }
    return value;
  },

  // "2024-01-15" -> "15 Ene"
  day: (value) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return value;
    const monthNum = parseInt(match[2], 10);
    return `${match[3]} ${MONTHS_SHORT[monthNum - 1]}`;
  },
};

// Detect format from value pattern
export const detectFormat = (value: string): XAxisFormat => {
  if (!value || typeof value !== "string") return "none";
  if (/^\d{4}$/.test(value)) return "year";
  if (/^\d{4}-\d{2}$/.test(value)) return "month";
  if (/^\d{4}-Q?\d$/.test(value)) return "quarter";
  if (/^\d{4}-W\d{2}$/.test(value)) return "week";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "day";
  return "none";
};

// Get the appropriate formatter based on format type
export const getTickFormatter = <T extends Record<string, unknown>>(
  xAxisFormat: XAxisFormat,
  data: T[],
  xAxisKey: keyof T,
): ((value: string) => string) => {
  if (xAxisFormat === "none") return (v: string) => v;

  const format =
    xAxisFormat === "auto" && data.length > 0
      ? detectFormat(String(data[0][xAxisKey]))
      : xAxisFormat;

  if (format === "none" || format === "auto") return (v: string) => v;
  return formatters[format];
};

// Calculate tick interval to show approximately maxLabels
export const calculateTickInterval = (
  dataLength: number,
  maxLabels: number,
): number => {
  return dataLength > maxLabels ? Math.floor(dataLength / maxLabels) : 0;
};
