import { COLORS } from "../../../common/colors";

/**
 * Colores por defecto para los gráficos
 */
export const DEFAULT_CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.info,
  COLORS.warning,
  COLORS.error,
  "#888888",
  "#bdbdbd",
  "#616161",
  "#a6a6a6",
  "#cfd8dc",
  "#424242",
];

/**
 * Obtiene un color de la paleta por índice (con ciclo)
 */
export function getChartColor(index: number, customColors?: string[]): string {
  const colors = customColors ?? DEFAULT_CHART_COLORS;
  return colors[index % colors.length];
}

/**
 * Configuraciones comunes para ejes
 */
export const AXIS_CONFIG = {
  stroke: "#888",
  tickLine: false,
  axisLine: { stroke: "#e0e0e0" },
} as const;

/**
 * Configuración común del grid
 */
export const GRID_CONFIG = {
  strokeDasharray: "3 3",
  stroke: "#e0e0e0",
} as const;

/**
 * Altura por defecto de los gráficos
 */
export const DEFAULT_CHART_HEIGHT = 250;
