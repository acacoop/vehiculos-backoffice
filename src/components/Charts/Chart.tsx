import {
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  ChartDataItem,
  ChartClickEvent,
  BarChartConfig,
  LineChartConfig,
  AreaChartConfig,
  PieChartConfig,
  RadarChartConfig,
  HistogramConfig,
  ChartFilter,
  ChartFetchResult,
} from "./core/types";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  RadarChart,
  Histogram,
} from "./components";
import "./styles/Charts.css";

// ============================================
// Chart Props (Unified Component)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyParams = Record<string, any>;

interface BaseChartCardProps<
  T extends ChartDataItem,
  TParams extends AnyParams = AnyParams,
> {
  /** Título del gráfico */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Contenido del pie de página - puede recibir meta del fetch */
  footer?: ReactNode | ((meta: Record<string, unknown>) => ReactNode);
  /** Ancho del card */
  width?: string | number;
  /** Altura del card */
  height?: string | number;
  /** Si el card es ancho completo */
  fullWidth?: boolean;
  /** Estilos adicionales */
  style?: CSSProperties;
  /** Clase CSS adicional */
  className?: string;
  /** Función para obtener datos dinámicamente */
  fetchData: (params: TParams) => Promise<ChartFetchResult<T>>;
  /** Filtros configurables para este gráfico */
  filters?: ChartFilter<TParams>[];
}

// ============================================
// Chart-specific props for each type
// ============================================

interface BaseChartSpecificProps<T extends ChartDataItem, TConfig> {
  config: TConfig;
  onElementClick?: (event: ChartClickEvent<T>) => void;
}

interface BarChartSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, BarChartConfig<T>> {
  type: "bar";
  direction?: "horizontal" | "vertical";
}

interface LineChartSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, LineChartConfig<T>> {
  type: "line";
}

interface AreaChartSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, AreaChartConfig<T>> {
  type: "area";
}

interface PieChartSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, PieChartConfig<T>> {
  type: "pie";
}

interface RadarChartSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, RadarChartConfig<T>> {
  type: "radar";
}

interface HistogramSpecificProps<T extends ChartDataItem = ChartDataItem>
  extends BaseChartSpecificProps<T, HistogramConfig<T>> {
  type: "histogram";
  direction?: "horizontal" | "vertical";
}

// Union type for chart-specific props
type ChartSpecificProps<T extends ChartDataItem = ChartDataItem> =
  | BarChartSpecificProps<T>
  | LineChartSpecificProps<T>
  | AreaChartSpecificProps<T>
  | PieChartSpecificProps<T>
  | RadarChartSpecificProps<T>
  | HistogramSpecificProps<T>;

export type ChartProps<
  T extends ChartDataItem = ChartDataItem,
  TParams extends AnyParams = AnyParams,
> = BaseChartCardProps<T, TParams> & ChartSpecificProps<T>;

// ============================================
// Chart Component
// ============================================

export default function Chart<
  T extends ChartDataItem = ChartDataItem,
  TParams extends AnyParams = AnyParams,
>(props: ChartProps<T, TParams>) {
  const {
    // Card props
    title,
    subtitle,
    footer,
    width,
    height,
    fullWidth = false,
    style,
    className = "",
    // Fetch props
    fetchData,
    filters = [],
    // Chart props
    type,
    config,
    onElementClick,
  } = props;

  // Internal state for fetching
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build initial filter values from defaults
  const buildInitialFilterValues = useCallback(() => {
    const initial: Record<string, string | number> = {};
    filters.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial as TParams;
  }, [filters]);

  const [filterValues, setFilterValues] = useState<TParams>(
    buildInitialFilterValues,
  );

  // Fetch data when filters change
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData(filterValues);
      setData(result.data);
      setMeta(result.meta ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData, filterValues]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string | number) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  // Extract direction for bar and histogram (default: horizontal)
  const direction =
    type === "histogram"
      ? (props as HistogramSpecificProps<T>).direction
      : type === "bar"
      ? (props as BarChartSpecificProps<T>).direction
      : undefined;

  const containerStyle: CSSProperties = { ...style };
  if (width) containerStyle.width = width;
  if (height) containerStyle.height = height;

  const cardClasses = [
    "chart-card",
    fullWidth ? "chart-card--full-width" : "",
    filters.length > 0 ? "chart-card--with-filters" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render filter controls
  const renderFilters = () => {
    if (filters.length === 0) return null;

    return (
      <div className="chart-card__filters">
        {filters.map((filter) => (
          <div key={filter.key} className="chart-card__filter">
            <label className="chart-card__filter-label">{filter.label}</label>
            {filter.type === "select" && filter.options ? (
              <select
                className="chart-card__filter-select"
                value={filterValues[filter.key] as string | number}
                onChange={(e) => {
                  const val = filter.options?.find(
                    (o) => String(o.value) === e.target.value,
                  )?.value;
                  handleFilterChange(filter.key, val ?? e.target.value);
                }}
              >
                {filter.options.map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="chart-card__filter-input"
                value={filterValues[filter.key] as number}
                min={filter.min}
                max={filter.max}
                onChange={(e) =>
                  handleFilterChange(filter.key, Number(e.target.value))
                }
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render footer with meta support
  const renderFooter = () => {
    if (!footer) return null;
    const content = typeof footer === "function" ? footer(meta) : footer;
    return <div className="chart-card__footer">{content}</div>;
  };

  // Loading state
  if (loading) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        {renderFilters()}
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
        {renderFilters()}
        <div className="chart-card__content chart-card__content--error">
          <span className="chart-card__error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Empty data state - show message instead of rendering chart
  if (!data || data.length === 0) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        {renderFilters()}
        <div className="chart-card__content">
          <span className="chart-card__empty-message">
            Sin datos disponibles
          </span>
        </div>
        {renderFooter()}
      </div>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    const baseProps = { data, onElementClick };

    switch (type) {
      case "bar":
        return (
          <BarChart<T>
            {...baseProps}
            {...(config as BarChartConfig<T>)}
            layout={direction === "vertical" ? "vertical" : "horizontal"}
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

      case "histogram":
        return (
          <Histogram<T>
            {...baseProps}
            {...(config as HistogramConfig<T>)}
            layout={direction === "vertical" ? "vertical" : "horizontal"}
          />
        );

      default:
        return (
          <div className="chart-card__unsupported">
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
      {renderFilters()}
      <div className="chart-card__content">{renderChart()}</div>
      {renderFooter()}
    </div>
  );
}
