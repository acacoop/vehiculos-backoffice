// Contenedores principales
export { ChartCard, GenericChart } from "./containers";

// Componentes de gráficos individuales
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
  BaseChartProps,
  AxisChartProps,
  BarChartProps,
  LineChartProps,
  AreaChartProps,
  PieChartProps,
  RadarChartProps,
  ChartCardProps,
  GenericChartProps,
  BarChartConfig,
  LineChartConfig,
  AreaChartConfig,
  PieChartConfig,
  RadarChartConfig,
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
