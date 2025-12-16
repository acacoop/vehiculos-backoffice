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
  GRID_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";

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

  // Custom tooltip component
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
      const label = String(item[xAxisKey] ?? "");
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

  if (isVertical) {
    return (
      <div style={{ width: "100%", height, ...style }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            {showGrid && <CartesianGrid {...GRID_CONFIG} />}
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey={xAxisKey} type="category" width={100} />
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
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}
          <XAxis
            dataKey={xAxisKey}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 13 }}
          />
          <YAxis allowDecimals={false} />
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
