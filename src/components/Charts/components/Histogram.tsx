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
import type { HistogramProps, ChartDataItem } from "../core/types";
import {
  GRID_CONFIG,
  AXIS_CONFIG,
  getChartColor,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";
import { getTickFormatter, calculateTickInterval } from "../core/formatters";
import { COLORS } from "../../../common";

/**
 * Histograma - Barras pegadas para distribuciones de frecuencia
 */
export default function Histogram<T extends ChartDataItem = ChartDataItem>({
  data,
  xAxisKey,
  series,
  layout = "horizontal",
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  onElementClick,
  style,
  maxXAxisLabels = 10,
  xAxisFormat = "none",
  specialCategories = [],
}: HistogramProps<T>) {
  const isVertical = layout === "vertical";
  const SPECIAL_COLOR = COLORS.default;

  // Check if a category is special (like "Sin registro")
  const isSpecialCategory = (item: T) => {
    const label = String(item[xAxisKey] ?? "");
    return specialCategories.includes(label);
  };

  const handleBarClick = (barData: T, index: number, seriesDataKey: string) => {
    if (onElementClick) {
      onElementClick({ data: barData, index, dataKey: seriesDataKey });
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload: T;
    }>;
  }) => {
    if (active && payload && payload.length > 0) {
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

  // For vertical (horizontal bars) layout
  if (isVertical) {
    return (
      <div style={{ width: "100%", height, ...style }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            barCategoryGap={0}
            barGap={0}
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
                radius={0}
                stackId={s.stackId}
                cursor={onElementClick ? "pointer" : undefined}
                onClick={(barData: T, index: number) =>
                  handleBarClick(barData, index, s.dataKey)
                }
              >
                {data.map((item, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isSpecialCategory(item)
                        ? SPECIAL_COLOR
                        : series.length === 1 && colors
                        ? getChartColor(index, colors)
                        : s.color || getChartColor(seriesIndex, colors)
                    }
                    stroke="#fff"
                    strokeWidth={1}
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

  // Horizontal layout (default)
  const tickFormatter = getTickFormatter(xAxisFormat, data, xAxisKey);
  const tickInterval = calculateTickInterval(data.length, maxXAxisLabels);

  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          barCategoryGap={0}
          barGap={0}
        >
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}
          <XAxis
            dataKey={xAxisKey}
            {...AXIS_CONFIG}
            tickMargin={8}
            interval={tickInterval}
            tickFormatter={tickFormatter}
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
              radius={0}
              stackId={s.stackId}
              cursor={onElementClick ? "pointer" : undefined}
              onClick={(barData: T, index: number) =>
                handleBarClick(barData, index, s.dataKey)
              }
            >
              {data.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    isSpecialCategory(item)
                      ? SPECIAL_COLOR
                      : series.length === 1 && colors
                      ? getChartColor(index, colors)
                      : s.color || getChartColor(seriesIndex, colors)
                  }
                  stroke="#fff"
                  strokeWidth={1}
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
