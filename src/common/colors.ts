/**
 * Color constants for use in TypeScript/JavaScript.
 * These values should match the CSS custom properties defined in index.css.
 * For CSS usage, prefer using var(--color-*) variables directly.
 */
export const COLORS = {
  // Brand Colors
  primary: "#282D86",
  primaryHover: "#1e2266",
  primaryLight: "rgba(40, 45, 134, 0.1)",
  secondary: "#FE9000",

  // Status Colors
  success: "#43A047",
  error: "#E53935",
  warning: "#FB8C00",
  info: "#039BE5",
  default: "#9E9E9E",

  // Neutral Colors
  textPrimary: "#333",
  textSecondary: "#666",
  textMuted: "#999",
  border: "#e0e0e0",
  background: "#f5f5f5",
  backgroundHover: "#e8e8e8",
  white: "#fff",
} as const;
