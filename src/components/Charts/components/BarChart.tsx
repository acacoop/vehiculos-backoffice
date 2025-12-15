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

  // Custom tooltip para mostrar el label correctamente
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: T;
      name: string;
      value: number;
      color: string;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const label = item[xAxisKey] as string;
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "8px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
              <XAxis
                dataKey={xAxisKey}
                stroke="#888"
                axisLine={{ stroke: "#e0e0e0" }}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#333" }}
                angle={data.length > 5 ? -45 : 0}
                textAnchor={data.length > 5 ? "end" : "middle"}
                height={data.length > 5 ? 80 : 50}
                interval={0}
                dy={data.length > 5 ? 5 : 10}
              />
              <YAxis allowDecimals={false} {...AXIS_CONFIG} />
            </>
          )}

          {showTooltip && <Tooltip content={<CustomTooltip />} />}
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
