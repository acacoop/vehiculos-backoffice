import type { CSSProperties, ReactNode } from "react";
import type {
  ChartDataItem,
  ChartClickEvent,
  BarChartConfig,
  LineChartConfig,
  AreaChartConfig,
  PieChartConfig,
  RadarChartConfig,
} from "./core/types";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  RadarChart,
} from "./components";
import "./styles/Charts.css";

// ============================================
// Chart Props (Unified Component)
// ============================================

interface BaseChartCardProps {
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
  /** Estilos adicionales */
  style?: CSSProperties;
  /** Clase CSS adicional */
  className?: string;
}

// ============================================
// Chart-specific props for each type
// ============================================

interface BarChartSpecificProps<T extends ChartDataItem = ChartDataItem> {
  type: "bar";
  data: T[];
  config: BarChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface HorizontalBarChartSpecificProps<
  T extends ChartDataItem = ChartDataItem,
> {
  type: "horizontalBar";
  data: T[];
  config: BarChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface LineChartSpecificProps<T extends ChartDataItem = ChartDataItem> {
  type: "line";
  data: T[];
  config: LineChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface AreaChartSpecificProps<T extends ChartDataItem = ChartDataItem> {
  type: "area";
  data: T[];
  config: AreaChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface PieChartSpecificProps<T extends ChartDataItem = ChartDataItem> {
  type: "pie";
  data: T[];
  config: PieChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface RadarChartSpecificProps<T extends ChartDataItem = ChartDataItem> {
  type: "radar";
  data: T[];
  config: RadarChartConfig<T>;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

// Union type for chart-specific props
type ChartSpecificProps<T extends ChartDataItem = ChartDataItem> =
  | BarChartSpecificProps<T>
  | HorizontalBarChartSpecificProps<T>
  | LineChartSpecificProps<T>
  | AreaChartSpecificProps<T>
  | PieChartSpecificProps<T>
  | RadarChartSpecificProps<T>;

export type ChartProps<T extends ChartDataItem = ChartDataItem> =
  BaseChartCardProps & ChartSpecificProps<T>;

// ============================================
// Chart Component
// ============================================

export default function Chart<T extends ChartDataItem = ChartDataItem>(
  props: ChartProps<T>,
) {
  const {
    // Card props
    title,
    subtitle,
    footer,
    width,
    height,
    fullWidth = false,
    loading = false,
    error,
    style,
    className = "",
    // Chart props
    type,
    data,
    config,
    onElementClick,
  } = props;

  const containerStyle: CSSProperties = { ...style };
  if (width) containerStyle.width = width;
  if (height) containerStyle.height = height;

  const cardClasses = [
    "chart-card",
    fullWidth ? "chart-card--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Loading state
  if (loading) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        <div className="chart-card__content chart-card__content--loading">
          <div className="chart-card__spinner" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        <div className="chart-card__content chart-card__content--error">
          <span className="chart-card__error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    const baseProps = { data, onElementClick };

    switch (type) {
      case "bar":
        return (
          <BarChart<T> {...baseProps} {...(config as BarChartConfig<T>)} />
        );

      case "horizontalBar":
        return (
          <BarChart<T>
            {...baseProps}
            {...(config as BarChartConfig<T>)}
            layout="vertical"
          />
        );

      case "line":
        return (
          <LineChart<T> {...baseProps} {...(config as LineChartConfig<T>)} />
        );

      case "area":
        return (
          <AreaChart<T> {...baseProps} {...(config as AreaChartConfig<T>)} />
        );

      case "pie":
        return (
          <PieChart<T> {...baseProps} {...(config as PieChartConfig<T>)} />
        );

      case "radar":
        return (
          <RadarChart<T> {...baseProps} {...(config as RadarChartConfig<T>)} />
        );

      default:
        return (
          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            Tipo de gráfico "{type}" no soportado
          </div>
        );
    }
  };

  return (
    <div className={cardClasses} style={containerStyle}>
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
      </div>
      <div className="chart-card__content">{renderChart()}</div>
      {footer && <div className="chart-card__footer">{footer}</div>}
    </div>
  );
}
