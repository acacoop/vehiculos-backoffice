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
  AXIS_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";
import { getTickFormatter, calculateTickInterval } from "../core/formatters";
import { COLORS } from "../../../common";

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
  maxXAxisLabels = 8,
  xAxisFormat = "auto",
  xAxisLabelRotation = 0,
  style,
}: BarChartProps<T>) {
  // 1. Sanitize the main height to ensure it's never NaN or invalid before rendering
  const validHeight =
    Number.isFinite(height) && height > 0 ? height : DEFAULT_CHART_HEIGHT;

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
            border: `1px solid ${COLORS.border}`,
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
      <div style={{ width: "100%", height: validHeight, ...style }}>
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
  const tickFormatter = getTickFormatter(xAxisFormat, data, xAxisKey);
  const tickInterval = calculateTickInterval(data.length, maxXAxisLabels);

  // Calculate bottom margin based on rotation
  const bottomMargin = xAxisLabelRotation !== 0 ? 60 : 5;
  const xAxisHeightProps = xAxisLabelRotation !== 0 ? { height: 80 } : {};

  return (
    <div style={{ width: "100%", height: validHeight, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: bottomMargin }}
        >
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}
          <XAxis
            dataKey={xAxisKey}
            {...AXIS_CONFIG}
            // Spread the conditional height props here
            {...xAxisHeightProps}
            tickMargin={8}
            interval={xAxisLabelRotation !== 0 ? 0 : tickInterval}
            tickFormatter={tickFormatter}
            angle={xAxisLabelRotation}
            textAnchor={xAxisLabelRotation !== 0 ? "end" : "middle"}
          />
          <YAxis allowDecimals={false} {...AXIS_CONFIG} />
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
