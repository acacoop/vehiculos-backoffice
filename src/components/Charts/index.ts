// Componente principal unificado
export { default as Chart } from "./Chart";
export type { ChartProps } from "./Chart";

// Componentes de gráficos individuales (uso avanzado)
export {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  RadarChart,
} from "./components";

// Tipos
export type {
  ChartType,
  ChartDataItem,
  ChartSeries,
  ChartClickEvent,
  BarChartConfig,
  LineChartConfig,
  AreaChartConfig,
  PieChartConfig,
  RadarChartConfig,
  ChartFilter,
  ChartFilterOption,
  ChartFetchResult,
} from "./core";

// Constantes y utilidades
export {
  DEFAULT_CHART_COLORS,
  getChartColor,
  AXIS_CONFIG,
  GRID_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "./core";

// CSS (importar para que se incluya en el bundle)
import "./styles/Charts.css";
