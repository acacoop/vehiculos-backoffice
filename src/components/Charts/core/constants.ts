import { COLORS } from "../../../common/colors";

/**
 * Colores por defecto para los gráficos
 * Usa primary, secondary y neutral colors para consistencia visual
 */
export const DEFAULT_CHART_COLORS = [
  COLORS.primary, // Azul primario
  COLORS.secondary, // Naranja secundario
  COLORS.textSecondary, // Gris oscuro
  COLORS.textMuted, // Gris medio
  COLORS.border, // Gris claro
  COLORS.black, // Gris muy claro
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
  stroke: COLORS.textMuted,
  tickLine: false,
  axisLine: { stroke: COLORS.border },
} as const;

/**
 * Configuración común del grid
 */
export const GRID_CONFIG = {
  strokeDasharray: "3 3",
  stroke: COLORS.border,
} as const;

/**
 * Altura por defecto de los gráficos
 */
export const DEFAULT_CHART_HEIGHT = 350;
