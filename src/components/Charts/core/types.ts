import type { CSSProperties } from "react";

/**
 * Tipos de gráficos disponibles
 */
export type ChartType = "bar" | "line" | "area" | "pie" | "radar" | "histogram";

/**
 * Datos base para cualquier gráfico
 * Usa Record para permitir cualquier objeto con propiedades string/number/boolean/null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChartDataItem = Record<string, any>;

/**
 * Configuración de una serie de datos (para gráficos con múltiples series)
 */
export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
}

/**
 * Callback cuando se hace click en un elemento del gráfico
 */
export interface ChartClickEvent<T = ChartDataItem> {
  data: T;
  index: number;
  dataKey?: string;
}

/**
 * Props base para todos los gráficos
 */
export interface BaseChartProps<T = ChartDataItem> {
  /** Datos del gráfico */
  data: T[];
  /** Altura del gráfico */
  height?: number;
  /** Colores personalizados para las series/elementos */
  colors?: string[];
  /** Mostrar tooltip */
  showTooltip?: boolean;
  /** Mostrar leyenda */
  showLegend?: boolean;
  /** Callback cuando se hace click en un elemento */
  onElementClick?: (event: ChartClickEvent<T>) => void;
  /** Mostrar grid */
  showGrid?: boolean;
  /** Estilos adicionales del contenedor */
  style?: CSSProperties;
}

/**
 * Props para gráficos con ejes (Bar, Line, Area)
 */
export interface AxisChartProps<T = ChartDataItem> extends BaseChartProps<T> {
  /** Key para el eje X */
  xAxisKey: string;
  /** Series de datos a mostrar */
  series: ChartSeries[];
  /** Layout del gráfico */
  layout?: "horizontal" | "vertical";
}

/**
 * Props para gráfico de barras
 */
export interface BarChartProps<T = ChartDataItem> extends AxisChartProps<T> {
  /** Radio del borde de las barras */
  barRadius?: number;
  /** Tamaño máximo de las barras */
  maxBarSize?: number;
  /** Máximo de etiquetas en el eje X */
  maxXAxisLabels?: number;
  /** Formato de las etiquetas del eje X (auto detecta el formato) */
  xAxisFormat?: XAxisFormat;
  /** Rotación de las etiquetas del eje X en grados (0 = horizontal, -45 = diagonal, -90 = vertical) */
  xAxisLabelRotation?: number;
}

/**
 * Props para histograma (barras pegadas para distribuciones)
 */
export interface HistogramProps<T = ChartDataItem> extends AxisChartProps<T> {
  /** Máximo de etiquetas en el eje X */
  maxXAxisLabels?: number;
  /** Formato de las etiquetas del eje X */
  xAxisFormat?: XAxisFormat;
  /** Categorías especiales que se muestran con color gris (ej: "Sin registro") */
  specialCategories?: string[];
  /** Rotación de las etiquetas del eje X en grados (0 = horizontal, -45 = diagonal, -90 = vertical) */
  xAxisLabelRotation?: number;
}

/**
 * Formato del eje X para gráficos de tiempo
 */
export type XAxisFormat =
  | "auto"
  | "year"
  | "month"
  | "week"
  | "day"
  | "quarter"
  | "none";

/**
 * Props para gráfico de líneas
 */
export interface LineChartProps<T = ChartDataItem> extends AxisChartProps<T> {
  /** Tipo de curva */
  curveType?: "linear" | "monotone" | "step";
  /** Mostrar puntos */
  showDots?: boolean;
  /** Grosor de la línea */
  strokeWidth?: number;
  /** Máximo de etiquetas en el eje X */
  maxXAxisLabels?: number;
  /** Formato de las etiquetas del eje X (auto detecta el formato) */
  xAxisFormat?: XAxisFormat;
}

/**
 * Props para gráfico de área
 */
export interface AreaChartProps<T = ChartDataItem> extends AxisChartProps<T> {
  /** Tipo de curva */
  curveType?: "linear" | "monotone" | "step";
  /** Opacidad del relleno */
  fillOpacity?: number;
  /** Máximo de etiquetas en el eje X */
  maxXAxisLabels?: number;
  /** Formato de las etiquetas del eje X (auto detecta el formato) */
  xAxisFormat?: XAxisFormat;
}

/**
 * Props para gráfico de pie/dona
 */
export interface PieChartProps<T = ChartDataItem> extends BaseChartProps<T> {
  /** Key para el nombre de cada segmento */
  nameKey: string;
  /** Key para el valor de cada segmento */
  dataKey: string;
  /** Radio interior (0 para pie, >0 para dona) */
  innerRadius?: number;
  /** Radio exterior */
  outerRadius?: number;
  /** Mostrar etiquetas */
  showLabels?: boolean;
  /** Formato personalizado de etiquetas */
  labelFormatter?: (entry: T, percent: number) => string;
}

/**
 * Props para gráfico de radar
 */
export interface RadarChartProps<T = ChartDataItem> extends BaseChartProps<T> {
  /** Key para las categorías del radar */
  angleKey: string;
  /** Series de datos a mostrar */
  series: ChartSeries[];
  /** Opacidad del relleno */
  fillOpacity?: number;
}

/**
 * Configuraciones específicas por tipo de gráfico
 */
export type BarChartConfig<T = ChartDataItem> = Omit<
  BarChartProps<T>,
  "data" | "onElementClick"
>;
export type HistogramConfig<T = ChartDataItem> = Omit<
  HistogramProps<T>,
  "data" | "onElementClick"
>;
export type LineChartConfig<T = ChartDataItem> = Omit<
  LineChartProps<T>,
  "data" | "onElementClick"
>;
export type AreaChartConfig<T = ChartDataItem> = Omit<
  AreaChartProps<T>,
  "data" | "onElementClick"
>;
export type PieChartConfig<T = ChartDataItem> = Omit<
  PieChartProps<T>,
  "data" | "onElementClick"
>;
export type RadarChartConfig<T = ChartDataItem> = Omit<
  RadarChartProps<T>,
  "data" | "onElementClick"
>;

// ============================================
// Filtros dinámicos para Charts
// ============================================

/**
 * Opción de un filtro select
 */
export interface ChartFilterOption<T = string | number> {
  value: T;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyParams = Record<string, any>;

/**
 * Definición de un filtro para el gráfico
 */
export interface ChartFilter<TParams extends AnyParams> {
  /** Key del parámetro que se pasará al fetch */
  key: keyof TParams & string;
  /** Label visible del filtro */
  label: string;
  /** Tipo de control */
  type: "select" | "number";
  /** Opciones para select */
  options?: ChartFilterOption[];
  /** Valor por defecto */
  defaultValue: string | number;
  /** Min para inputs numéricos */
  min?: number;
  /** Max para inputs numéricos */
  max?: number;
}

/**
 * Resultado de una función de fetch de datos
 */
export interface ChartFetchResult<T> {
  data: T[];
  /** Datos adicionales para mostrar (ej: totales) */
  meta?: Record<string, unknown>;
}
