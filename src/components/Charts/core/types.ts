import type { CSSProperties, ReactNode } from "react";

/**
 * Tipos de gráficos disponibles
 */
export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "radar"
  | "horizontalBar";

/**
 * Datos base para cualquier gráfico
 * Permite string, number, boolean y null como valores
 */
export interface ChartDataItem {
  [key: string]: string | number | boolean | null | undefined;
}

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
}

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
}

/**
 * Props para gráfico de área
 */
export interface AreaChartProps<T = ChartDataItem> extends AxisChartProps<T> {
  /** Tipo de curva */
  curveType?: "linear" | "monotone" | "step";
  /** Opacidad del relleno */
  fillOpacity?: number;
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
 * Props para el componente ChartCard (contenedor)
 */
export interface ChartCardProps {
  /** Título del gráfico */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Contenido del pie de página */
  footer?: ReactNode;
  /** Ancho del card */
  width?: string | number;
  /** Altura del card */
  height?: string | number;
  /** Si el card es ancho completo */
  fullWidth?: boolean;
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Contenido del gráfico */
  children: ReactNode;
  /** Estilos adicionales */
  style?: CSSProperties;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Configuraciones específicas por tipo de gráfico
 */
export type BarChartConfig<T = ChartDataItem> = Omit<
  BarChartProps<T>,
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

/**
 * Props para el componente GenericChart (wrapper principal) con tipos discriminados
 */
export type GenericChartProps<T = ChartDataItem> =
  | {
      type: "bar";
      data: T[];
      config: BarChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    }
  | {
      type: "horizontalBar";
      data: T[];
      config: BarChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    }
  | {
      type: "line";
      data: T[];
      config: LineChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    }
  | {
      type: "area";
      data: T[];
      config: AreaChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    }
  | {
      type: "pie";
      data: T[];
      config: PieChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    }
  | {
      type: "radar";
      data: T[];
      config: RadarChartConfig<T>;
      onElementClick?: (event: ChartClickEvent<T>) => void;
    };
