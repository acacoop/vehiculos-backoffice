import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LineChartProps, ChartClickEvent } from "../core/types";
import {
  getChartColor,
  AXIS_CONFIG,
  GRID_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";

export default function LineChartComponent<T extends Record<string, unknown>>({
  data,
  xAxisKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  onElementClick,
  curveType = "monotone",
  showDots = true,
  strokeWidth = 2,
  style,
}: LineChartProps<T>) {
  const handleLineClick = (
    lineData: T,
    index: number,
    seriesDataKey: string
  ) => {
    if (onElementClick) {
      onElementClick({
        data: lineData,
        index,
        dataKey: seriesDataKey,
      } as ChartClickEvent<T>);
    }
  };

  return (
    <div style={{ width: "100%", height, ...style, marginLeft: -50 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload[0] && onElementClick) {
              const payload = e.activePayload[0];
              handleLineClick(
                payload.payload as T,
                e.activeTooltipIndex ?? 0,
                payload.dataKey as string
              );
            }
          }}
        >
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}
          <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} tick={{ dy: 15 }} />
          <YAxis allowDecimals={false} {...AXIS_CONFIG} />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}

          {series.map((s, seriesIndex) => (
            <Line
              key={s.dataKey}
              type={curveType}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color || getChartColor(seriesIndex, colors)}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: 4, strokeWidth: 2 } : false}
              activeDot={
                onElementClick ? { r: 6, cursor: "pointer" } : { r: 6 }
              }
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
