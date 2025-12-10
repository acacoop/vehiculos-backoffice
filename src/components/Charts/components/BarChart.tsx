import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BarChartProps, ChartClickEvent } from "../core/types";
import {
  getChartColor,
  AXIS_CONFIG,
  GRID_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";

/**
 * Componente de gráfico de barras genérico.
 * Soporta layout vertical y horizontal, múltiples series y click handlers.
 */
export default function BarChartComponent<T extends Record<string, unknown>>({
  data,
  xAxisKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  onElementClick,
  layout = "horizontal",
  barRadius = 4,
  maxBarSize = 60,
  style,
}: BarChartProps<T>) {
  const handleBarClick = (barData: T, index: number, seriesDataKey: string) => {
    if (onElementClick) {
      onElementClick({
        data: barData,
        index,
        dataKey: seriesDataKey,
      } as ChartClickEvent<T>);
    }
  };

  const isVertical = layout === "vertical";

  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} layout={layout}>
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}

          {isVertical ? (
            <>
              <XAxis type="number" allowDecimals={false} {...AXIS_CONFIG} />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                width={120}
                {...AXIS_CONFIG}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} />
              <YAxis allowDecimals={false} {...AXIS_CONFIG} />
            </>
          )}

          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}

          {series.map((s, seriesIndex) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color || getChartColor(seriesIndex, colors)}
              radius={barRadius}
              maxBarSize={maxBarSize}
              stackId={s.stackId}
              cursor={onElementClick ? "pointer" : undefined}
              onClick={(barData: T, index: number) =>
                handleBarClick(barData, index, s.dataKey)
              }
            >
              {/* Si hay un solo serie y queremos colores individuales por barra */}
              {series.length === 1 &&
                colors &&
                data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getChartColor(index, colors)}
                    cursor={onElementClick ? "pointer" : undefined}
                  />
                ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
